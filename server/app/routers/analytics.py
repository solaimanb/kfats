from typing import Dict, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.database import get_db
from app.core.dependencies import get_current_active_user, require_role
from app.models.user import User as DBUser
from app.models.course import Course as DBCourse, Enrollment as DBEnrollment
from app.models.article import Article as DBArticle
from app.models.product import Product as DBProduct
from app.schemas.common import UserRole, UserStatus, CourseStatus, ArticleStatus, ProductStatus
from app.schemas.user import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# Overview Analytics
@router.get("/overview")
async def get_overview_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get system overview analytics."""
    
    # Basic counts
    total_users = db.query(DBUser).count()
    total_courses = db.query(DBCourse).count()
    total_articles = db.query(DBArticle).count()
    total_products = db.query(DBProduct).count()
    total_enrollments = db.query(DBEnrollment).count()
    
    # Recent activity (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users_this_month = db.query(DBUser).filter(
        DBUser.created_at >= thirty_days_ago
    ).count()
    
    new_courses_this_month = db.query(DBCourse).filter(
        DBCourse.created_at >= thirty_days_ago
    ).count()
    
    new_articles_this_month = db.query(DBArticle).filter(
        DBArticle.created_at >= thirty_days_ago
    ).count()
    
    # User role distribution
    user_roles = db.query(
        DBUser.role, func.count(DBUser.id)
    ).group_by(DBUser.role).all()
    
    user_role_distribution = {role.value: count for role, count in user_roles}
    
    return {
        "totals": {
            "users": total_users,
            "courses": total_courses,
            "articles": total_articles,
            "products": total_products,
            "enrollments": total_enrollments
        },
        "growth": {
            "new_users_this_month": new_users_this_month,
            "new_courses_this_month": new_courses_this_month,
            "new_articles_this_month": new_articles_this_month
        },
        "user_distribution": user_role_distribution
    }


# User Analytics
@router.get("/users")
async def get_user_analytics(
    current_user: User = Depends(require_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Get detailed user analytics (Admin only)."""
    
    # User status distribution
    user_statuses = db.query(
        DBUser.status, func.count(DBUser.id)
    ).group_by(DBUser.status).all()
    
    status_distribution = {status.value: count for status, count in user_statuses}
    
    # User growth over time (last 12 months)
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    monthly_registrations = db.query(
        func.date_trunc('month', DBUser.created_at).label('month'),
        func.count(DBUser.id).label('count')
    ).filter(
        DBUser.created_at >= twelve_months_ago
    ).group_by(
        func.date_trunc('month', DBUser.created_at)
    ).order_by('month').all()
    
    growth_trend = [
        {
            "month": month.strftime("%Y-%m"),
            "count": count
        }
        for month, count in monthly_registrations
    ]
    
    # Active users (logged in within last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users = db.query(DBUser).filter(
        and_(
            DBUser.last_login.isnot(None),
            DBUser.last_login >= thirty_days_ago
        )
    ).count()
    
    return {
        "status_distribution": status_distribution,
        "growth_trend": growth_trend,
        "active_users": active_users,
        "total_users": db.query(DBUser).count()
    }


# Course Analytics
@router.get("/courses")
async def get_course_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get course performance analytics."""
    
    # Basic course stats
    total_courses = db.query(DBCourse).count()
    published_courses = db.query(DBCourse).filter(
        DBCourse.status == CourseStatus.PUBLISHED
    ).count()
    
    # Enrollment trends
    enrollment_trends = db.query(
        func.date_trunc('month', DBEnrollment.enrolled_at).label('month'),
        func.count(DBEnrollment.id).label('enrollments')
    ).group_by(
        func.date_trunc('month', DBEnrollment.enrolled_at)
    ).order_by('month').all()
    
    enrollment_trend_data = [
        {
            "month": month.strftime("%Y-%m") if month else "Unknown",
            "enrollments": enrollments
        }
        for month, enrollments in enrollment_trends
    ]
    
    # Popular courses
    popular_courses = db.query(
        DBCourse.id,
        DBCourse.title,
        DBCourse.enrolled_count,
        func.count(DBEnrollment.id).label('actual_enrollments')
    ).outerjoin(DBEnrollment).group_by(
        DBCourse.id, DBCourse.title, DBCourse.enrolled_count
    ).order_by(
        func.count(DBEnrollment.id).desc()
    ).limit(10).all()
    
    popular_courses_data = [
        {
            "course_id": course_id,
            "title": title,
            "enrolled_count": enrolled_count,
            "actual_enrollments": actual_enrollments
        }
        for course_id, title, enrolled_count, actual_enrollments in popular_courses
    ]
    
    # Mentor performance
    if current_user.role in [UserRole.ADMIN, UserRole.MENTOR]:
        mentor_stats = db.query(
            DBUser.id,
            DBUser.full_name,
            func.count(DBCourse.id).label('total_courses'),
            func.sum(DBCourse.enrolled_count).label('total_students')
        ).join(DBCourse, DBUser.id == DBCourse.mentor_id).group_by(
            DBUser.id, DBUser.full_name
        ).order_by(
            func.sum(DBCourse.enrolled_count).desc()
        ).limit(10).all()
        
        mentor_performance = [
            {
                "mentor_id": mentor_id,
                "mentor_name": mentor_name,
                "total_courses": total_courses,
                "total_students": total_students or 0
            }
            for mentor_id, mentor_name, total_courses, total_students in mentor_stats
        ]
    else:
        mentor_performance = []
    
    return {
        "overview": {
            "total_courses": total_courses,
            "published_courses": published_courses,
            "total_enrollments": db.query(DBEnrollment).count()
        },
        "enrollment_trends": enrollment_trend_data,
        "popular_courses": popular_courses_data,
        "mentor_performance": mentor_performance
    }


# Article Analytics
@router.get("/articles")
async def get_article_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get article and content analytics."""
    
    # Basic article stats
    total_articles = db.query(DBArticle).count()
    published_articles = db.query(DBArticle).filter(
        DBArticle.status == ArticleStatus.PUBLISHED
    ).count()
    
    total_views = db.query(func.sum(DBArticle.views_count)).scalar() or 0
    
    # Popular articles
    popular_articles = db.query(
        DBArticle.id,
        DBArticle.title,
        DBArticle.views_count,
        DBUser.full_name.label('author_name')
    ).join(DBUser, DBArticle.author_id == DBUser.id).filter(
        DBArticle.status == ArticleStatus.PUBLISHED
    ).order_by(DBArticle.views_count.desc()).limit(10).all()
    
    popular_articles_data = [
        {
            "article_id": article_id,
            "title": title,
            "views": views_count,
            "author": author_name
        }
        for article_id, title, views_count, author_name in popular_articles
    ]
    
    # Writer performance
    if current_user.role in [UserRole.ADMIN, UserRole.WRITER]:
        writer_stats = db.query(
            DBUser.id,
            DBUser.full_name,
            func.count(DBArticle.id).label('total_articles'),
            func.sum(DBArticle.views_count).label('total_views')
        ).join(DBArticle, DBUser.id == DBArticle.author_id).group_by(
            DBUser.id, DBUser.full_name
        ).order_by(
            func.sum(DBArticle.views_count).desc()
        ).limit(10).all()
        
        writer_performance = [
            {
                "writer_id": writer_id,
                "writer_name": writer_name,
                "total_articles": total_articles,
                "total_views": total_views or 0
            }
            for writer_id, writer_name, total_articles, total_views in writer_stats
        ]
    else:
        writer_performance = []
    
    return {
        "overview": {
            "total_articles": total_articles,
            "published_articles": published_articles,
            "total_views": total_views
        },
        "popular_articles": popular_articles_data,
        "writer_performance": writer_performance
    }


# Product Analytics
@router.get("/products")
async def get_product_analytics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get product and marketplace analytics."""
    
    # Basic product stats
    total_products = db.query(DBProduct).count()
    active_products = db.query(DBProduct).filter(
        DBProduct.status == ProductStatus.ACTIVE
    ).count()
    
    # Inventory value
    total_inventory_value = db.query(
        func.sum(DBProduct.price * DBProduct.stock_quantity)
    ).filter(
        and_(
            DBProduct.status == ProductStatus.ACTIVE,
            DBProduct.stock_quantity.isnot(None)
        )
    ).scalar() or 0
    
    # Low stock alerts
    low_stock_products = db.query(
        DBProduct.id,
        DBProduct.name,
        DBProduct.stock_quantity,
        DBUser.full_name.label('seller_name')
    ).join(DBUser, DBProduct.seller_id == DBUser.id).filter(
        and_(
            DBProduct.status == ProductStatus.ACTIVE,
            DBProduct.stock_quantity.isnot(None),
            DBProduct.stock_quantity <= 5
        )
    ).all()
    
    low_stock_alerts = [
        {
            "product_id": product_id,
            "name": name,
            "stock": stock_quantity,
            "seller": seller_name
        }
        for product_id, name, stock_quantity, seller_name in low_stock_products
    ]
    
    # Category distribution
    category_distribution = db.query(
        DBProduct.category,
        func.count(DBProduct.id).label('count')
    ).filter(
        DBProduct.status == ProductStatus.ACTIVE
    ).group_by(DBProduct.category).all()
    
    category_data = {
        category.value: count for category, count in category_distribution
    }
    
    return {
        "overview": {
            "total_products": total_products,
            "active_products": active_products,
            "total_inventory_value": float(total_inventory_value)
        },
        "category_distribution": category_data,
        "low_stock_alerts": low_stock_alerts
    }


# Activity Analytics
@router.get("/activity")
async def get_recent_activity(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Get recent system activity."""
    
    activities = []
    
    # Recent user registrations
    recent_users = db.query(DBUser).order_by(
        DBUser.created_at.desc()
    ).limit(10).all()
    
    for user in recent_users:
        activities.append({
            "type": "user_registration",
            "description": f"New user registered: {user.full_name}",
            "timestamp": user.created_at,
            "user_id": user.id
        })
    
    # Recent course creations
    recent_courses = db.query(DBCourse).order_by(
        DBCourse.created_at.desc()
    ).limit(10).all()
    
    for course in recent_courses:
        activities.append({
            "type": "course_created",
            "description": f"Course created: {course.title}",
            "timestamp": course.created_at,
            "course_id": course.id
        })
    
    # Recent article publications
    recent_articles = db.query(DBArticle).filter(
        DBArticle.status == ArticleStatus.PUBLISHED
    ).order_by(DBArticle.published_at.desc()).limit(10).all()
    
    for article in recent_articles:
        activities.append({
            "type": "article_published",
            "description": f"Article published: {article.title}",
            "timestamp": article.published_at or article.created_at,
            "article_id": article.id
        })
    
    # Sort all activities by timestamp
    activities.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "activities": activities[:limit]
    }
