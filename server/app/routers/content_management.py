from typing import Optional, Any
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, desc, text, cast, String
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.core.database import get_db
from app.core.dependencies import require_role
from app.models.user import User as DBUser
from app.models.article import Article as DBArticle
from app.models.course import Course as DBCourse
from app.models.product import Product as DBProduct
from app.schemas.user import User
from app.schemas.common import UserRole, ArticleStatus, CourseStatus, ProductStatus, PaginatedResponse, SuccessResponse
from app.schemas.content_management import (
    ContentActionRequest, 
    AdminNotesRequest, 
    ContentOverviewItem, 
    ContentStats
)

router = APIRouter(prefix="/content-management", tags=["Content Management"])


def get_content_type_model(content_type: str):
    """Get the appropriate model class for content type."""
    content_models = {
        "articles": DBArticle,
        "courses": DBCourse,
        "products": DBProduct
    }
    return content_models.get(content_type)


def get_content_type_name_field(content_type: str) -> str:
    """Get the name field for different content types."""
    name_fields = {
        "articles": "title",
        "courses": "title", 
        "products": "name"
    }
    return name_fields.get(content_type, "title")


def get_content_type_author_field(content_type: str) -> str:
    """Get the author field for different content types."""
    author_fields = {
        "articles": "author_id",
        "courses": "mentor_id",
        "products": "seller_id"
    }
    # Default to 'author_id' to satisfy type check; callers only pass known types.
    return author_fields.get(content_type, "author_id")


def map_content_to_overview_item(content: Any, content_type: str, author_name: str, author_role: str) -> ContentOverviewItem:
    """Map database content model to ContentOverviewItem."""
    title = getattr(content, get_content_type_name_field(content_type))
    return ContentOverviewItem(
        id=content.id,
        title=title,
        type=content_type[:-1],
        status=content.status.value if hasattr(content.status, 'value') else content.status,
        author_id=getattr(content, get_content_type_author_field(content_type)),
        author_name=author_name,
        author_role=author_role,
        created_at=content.created_at,
        updated_at=content.updated_at,
        published_at=getattr(content, 'published_at', None),
        views_count=getattr(content, 'views_count', 0),
        is_featured=getattr(content, 'is_featured', False),
        admin_notes=getattr(content, 'admin_notes', None),
        admin_action_by=getattr(content, 'admin_action_by', None),
        admin_action_at=getattr(content, 'admin_action_at', None)
    )


@router.get("/all-content", response_model=PaginatedResponse[ContentOverviewItem])
async def get_all_content(
    content_type: Optional[str] = Query(None, regex="^(articles|courses|products|all)$"),
    status_filter: Optional[str] = Query(None),
    author_role: Optional[UserRole] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Get all content across platform for admin oversight."""
    
    content_items = []
    total_count = 0
    
    content_types = ["articles", "courses", "products"] if content_type == "all" or content_type is None else [content_type]
    
    for ct in content_types:
        model = get_content_type_model(ct)
        if not model:
            continue
            
        query = db.query(model).join(DBUser, getattr(model, get_content_type_author_field(ct)) == DBUser.id)
        
        if status_filter:
            # Normalize string status to Enum value per content type
            try:
                enum_value = (
                    ArticleStatus(status_filter) if ct == "articles" else
                    CourseStatus(status_filter) if ct == "courses" else
                    ProductStatus(status_filter)
                )
                query = query.filter(model.status == enum_value)
            except Exception:
                # Fallback to string comparison if DB stores raw strings
                query = query.filter(cast(model.status, String) == status_filter)
            
        if author_role:
            query = query.filter(DBUser.role == author_role)
            
        if search:
            name_field = getattr(model, get_content_type_name_field(ct))
            query = query.filter(
                or_(
                    name_field.ilike(f"%{search}%"),
                    model.description.ilike(f"%{search}%") if hasattr(model, 'description') else text("false"),
                    DBUser.full_name.ilike(f"%{search}%")
                )
            )
        
        type_count = query.count()
        total_count += type_count
        
        skip = (page - 1) * size
        results = query.options(
            joinedload(getattr(model, 'author', None)) if hasattr(model, 'author') else
            joinedload(getattr(model, 'mentor', None)) if hasattr(model, 'mentor') else
            joinedload(getattr(model, 'seller', None))
        ).order_by(desc(model.created_at)).offset(skip).limit(size).all()
        
        for item in results:
            if hasattr(item, 'author'):
                author = item.author
            elif hasattr(item, 'mentor'):
                author = item.mentor
            elif hasattr(item, 'seller'):
                author = item.seller
            else:
                continue
                
            content_items.append(map_content_to_overview_item(
                item, ct, author.full_name, author.role.value
            ))
    
    content_items.sort(key=lambda x: x.created_at, reverse=True)
    pages = (total_count + size - 1) // size
    
    return PaginatedResponse(
        items=content_items[:size],
        total=total_count,
        page=page,
        size=size,
        pages=pages
    )


@router.put("/content/{content_type}/{content_id}/toggle-status", response_model=SuccessResponse)
async def toggle_content_status(
    content_type: str,
    content_id: int,
    action_data: ContentActionRequest,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Admin: Publish/Unpublish/Archive content."""
    
    model = get_content_type_model(content_type)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type: {content_type}"
        )
    
    content = db.query(model).filter(model.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    if action_data.action == "publish":
        if content_type == "articles":
            content.status = ArticleStatus.PUBLISHED
        elif content_type == "courses":
            content.status = CourseStatus.PUBLISHED
        elif content_type == "products":
            content.status = ProductStatus.ACTIVE
    elif action_data.action == "unpublish":
        if content_type == "articles":
            content.status = ArticleStatus.DRAFT
        elif content_type == "courses":
            content.status = CourseStatus.DRAFT
        elif content_type == "products":
            content.status = ProductStatus.DRAFT
    elif action_data.action == "archive":
        if content_type == "articles":
            content.status = ArticleStatus.ARCHIVED
        elif content_type == "courses":
            content.status = CourseStatus.ARCHIVED
        elif content_type == "products":
            content.status = ProductStatus.DRAFT
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action: {action_data.action}"
        )
    
    # Update admin action fields
    content.admin_action_by = current_user.id
    content.admin_action_at = datetime.utcnow()
    if action_data.admin_notes:
        content.admin_notes = action_data.admin_notes
    
    # Set published_at if publishing
    if action_data.action == "publish" and hasattr(content, 'published_at'):
        if not content.published_at:
            content.published_at = datetime.utcnow()
    
    db.commit()
    
    return SuccessResponse(
        message=f"Content {action_data.action}ed successfully",
        data={
            "content_id": content_id,
            "content_type": content_type,
            "new_status": content.status.value if hasattr(content.status, 'value') else content.status,
            "action": action_data.action
        }
    )


@router.put("/content/{content_type}/{content_id}/feature", response_model=SuccessResponse)
async def toggle_feature_content(
    content_type: str,
    content_id: int,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Admin: Feature/unfeature content."""
    
    model = get_content_type_model(content_type)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type: {content_type}"
        )
    
    content = db.query(model).filter(model.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content.is_featured = not content.is_featured
    content.admin_action_by = current_user.id
    content.admin_action_at = datetime.utcnow()
    
    db.commit()
    
    action = "featured" if content.is_featured else "unfeatured"
    return SuccessResponse(
        message=f"Content {action} successfully",
        data={
            "content_id": content_id,
            "content_type": content_type,
            "is_featured": content.is_featured
        }
    )


@router.put("/content/{content_type}/{content_id}/admin-notes", response_model=SuccessResponse)
async def update_admin_notes(
    content_type: str,
    content_id: int,
    notes_data: AdminNotesRequest,
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Admin: Add notes to content."""
    
    model = get_content_type_model(content_type)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid content type: {content_type}"
        )
    
    content = db.query(model).filter(model.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content.admin_notes = notes_data.notes
    content.admin_action_by = current_user.id
    content.admin_action_at = datetime.utcnow()
    
    db.commit()
    
    return SuccessResponse(
        message="Admin notes updated successfully",
        data={
            "content_id": content_id,
            "content_type": content_type,
            "admin_notes": content.admin_notes
        }
    )


@router.get("/content-stats", response_model=ContentStats)
async def get_content_overview_stats(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Get content statistics for admin dashboard."""
    
    stats = {
        "total_published": 0,
        "total_unpublished": 0,
        "total_drafts": 0,
        "total_archived": 0,
        "total_featured": 0,
        "by_type": {},
        "by_author_role": {},
        "recent_activity": []
    }
    
    content_types = [
        ("articles", DBArticle, ArticleStatus),
        ("courses", DBCourse, CourseStatus),
        ("products", DBProduct, ProductStatus)
    ]
    
    for type_name, model, status_enum in content_types:
        try:
            total_count = db.query(model).count()
            stats["by_type"][type_name] = total_count
            
            # Count published/active content
            if hasattr(status_enum, 'PUBLISHED'):
                try:
                    published_count = db.query(model).filter(model.status == status_enum.PUBLISHED).count()
                    stats["total_published"] += published_count
                except Exception as e:
                    # Fallback to string comparison and rollback failed tx
                    db.rollback()
                    try:
                        published_count = db.query(model).filter(cast(model.status, String) == 'published').count()
                        stats["total_published"] += published_count
                    except Exception as e2:
                        db.rollback()
                        print(f"Error querying {type_name} PUBLISHED: {e} | fallback: {e2}")
            elif hasattr(status_enum, 'ACTIVE'): 
                try:
                    active_count = db.query(model).filter(model.status == status_enum.ACTIVE).count()
                    stats["total_published"] += active_count
                except Exception as e:
                    db.rollback()
                    try:
                        active_count = db.query(model).filter(cast(model.status, String) == 'active').count()
                        stats["total_published"] += active_count
                    except Exception as e2:
                        db.rollback()
                        print(f"Error querying {type_name} ACTIVE: {e} | fallback: {e2}")
                    
            if hasattr(status_enum, 'DRAFT'):
                try:
                    draft_count = db.query(model).filter(model.status == status_enum.DRAFT).count()
                    stats["total_drafts"] += draft_count
                    stats["total_unpublished"] += draft_count
                except Exception as e:
                    db.rollback()
                    try:
                        draft_count = db.query(model).filter(cast(model.status, String) == 'draft').count()
                        stats["total_drafts"] += draft_count
                        stats["total_unpublished"] += draft_count
                    except Exception as e2:
                        db.rollback()
                        print(f"Error querying {type_name} DRAFT: {e} | fallback: {e2}")
                    
            # Count archived content
            if hasattr(status_enum, 'ARCHIVED'):
                try:
                    archived_count = db.query(model).filter(model.status == status_enum.ARCHIVED).count()
                    stats["total_archived"] += archived_count
                except Exception as e:
                    db.rollback()
                    try:
                        archived_count = db.query(model).filter(cast(model.status, String) == 'archived').count()
                        stats["total_archived"] += archived_count
                    except Exception as e2:
                        db.rollback()
                        print(f"Error querying {type_name} ARCHIVED: {e} | fallback: {e2}")
            
            # Count out of stock products as unpublished
            if hasattr(status_enum, 'OUT_OF_STOCK'):
                try:
                    oos_count = db.query(model).filter(model.status == status_enum.OUT_OF_STOCK).count()
                    stats["total_unpublished"] += oos_count
                except Exception as e:
                    db.rollback()
                    try:
                        oos_count = db.query(model).filter(cast(model.status, String) == 'out_of_stock').count()
                        stats["total_unpublished"] += oos_count
                    except Exception as e2:
                        db.rollback()
                        print(f"Error querying {type_name} OUT_OF_STOCK: {e} | fallback: {e2}")
            
            # Featured content
            try:
                featured_count = db.query(model).filter(model.is_featured == True).count()
                stats["total_featured"] += featured_count
            except Exception as e:
                db.rollback()
                print(f"Error querying {type_name} featured: {e}")
                
        except Exception as e:
            print(f"Error processing {type_name}: {e}")
            stats["by_type"][type_name] = 0
    
    # Count by author role - simplified version to avoid complex query errors
    try:
        # Get separate counts for each content type
        article_authors = db.query(DBUser.role, func.count(DBArticle.id))\
            .join(DBArticle, DBUser.id == DBArticle.author_id)\
            .group_by(DBUser.role).all()
        
        course_authors = db.query(DBUser.role, func.count(DBCourse.id))\
            .join(DBCourse, DBUser.id == DBCourse.mentor_id)\
            .group_by(DBUser.role).all()
            
        product_authors = db.query(DBUser.role, func.count(DBProduct.id))\
            .join(DBProduct, DBUser.id == DBProduct.seller_id)\
            .group_by(DBUser.role).all()
        
        # Combine the counts
        role_totals = {}
        for role, count in article_authors + course_authors + product_authors:
            role_key = role.value if hasattr(role, 'value') else str(role)
            role_totals[role_key] = role_totals.get(role_key, 0) + count
            
        stats["by_author_role"] = role_totals
        
    except Exception as e:
        db.rollback()
        print(f"Error getting author role stats: {e}")
        stats["by_author_role"] = {}
    
    return ContentStats(**stats)
