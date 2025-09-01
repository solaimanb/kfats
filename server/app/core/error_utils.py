"""
Error handling utilities for KFATS LMS application.
Provides helper functions for consistent error handling across the application.
"""

from typing import Any, Dict, Optional, Union
from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, DataError

from ..core.exceptions import (
    KFATSException,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    DatabaseError,
    BusinessLogicError,
    ExternalServiceError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    UserNotFoundError,
    CourseNotFoundError,
    ArticleNotFoundError,
    ProductNotFoundError,
    OrderNotFoundError,
    InsufficientStockError,
    DuplicateEnrollmentError,
    InvalidRoleTransitionError,
    PaymentRequiredError,
    FileUploadError,
    ConfigurationError
)


def handle_database_error(error: SQLAlchemyError) -> None:
    """
    Handle database errors and raise appropriate KFATS exceptions.

    Args:
        error: SQLAlchemy error instance

    Raises:
        DatabaseError: For general database errors
        ConflictError: For integrity constraint violations
        ValidationError: For data validation errors
    """
    if isinstance(error, IntegrityError):
        raise ConflictError(
            message="Data integrity constraint violated",
            details={"original_error": str(error)}
        )
    elif isinstance(error, DataError):
        raise ValidationError(
            message="Invalid data provided",
            details={"original_error": str(error)}
        )
    else:
        raise DatabaseError(
            message="Database operation failed",
            details={"original_error": str(error)}
        )


def handle_validation_error(field: str, message: str, **kwargs) -> ValidationError:
    """
    Create a validation error with field-specific details.

    Args:
        field: The field that failed validation
        message: Validation error message
        **kwargs: Additional details

    Returns:
        ValidationError instance
    """
    return ValidationError(
        message=f"Validation failed for field '{field}': {message}",
        details={"field": field, "validation_message": message, **kwargs}
    )


def ensure_user_exists(user_id: Optional[int], user_data: Optional[Any] = None) -> None:
    """
    Ensure a user exists, raising UserNotFoundError if not.

    Args:
        user_id: User ID to check
        user_data: User data object (optional)

    Raises:
        UserNotFoundError: If user doesn't exist
    """
    if user_data is None or (user_id and not user_data):
        raise UserNotFoundError(user_id=user_id)


def ensure_course_exists(course_id: Optional[int], course_data: Optional[Any] = None) -> None:
    """
    Ensure a course exists, raising CourseNotFoundError if not.

    Args:
        course_id: Course ID to check
        course_data: Course data object (optional)

    Raises:
        CourseNotFoundError: If course doesn't exist
    """
    if course_data is None or (course_id and not course_data):
        raise CourseNotFoundError(course_id=course_id)


def ensure_article_exists(article_id: Optional[int], article_data: Optional[Any] = None) -> None:
    """
    Ensure an article exists, raising ArticleNotFoundError if not.

    Args:
        article_id: Article ID to check
        article_data: Article data object (optional)

    Raises:
        ArticleNotFoundError: If article doesn't exist
    """
    if article_data is None or (article_id and not article_data):
        raise ArticleNotFoundError(article_id=article_id)


def ensure_product_exists(product_id: Optional[int], product_data: Optional[Any] = None) -> None:
    """
    Ensure a product exists, raising ProductNotFoundError if not.

    Args:
        product_id: Product ID to check
        product_data: Product data object (optional)

    Raises:
        ProductNotFoundError: If product doesn't exist
    """
    if product_data is None or (product_id and not product_data):
        raise ProductNotFoundError(product_id=product_id)


def ensure_order_exists(order_id: Optional[int], order_data: Optional[Any] = None) -> None:
    """
    Ensure an order exists, raising OrderNotFoundError if not.

    Args:
        order_id: Order ID to check
        order_data: Order data object (optional)

    Raises:
        OrderNotFoundError: If order doesn't exist
    """
    if order_data is None or (order_id and not order_data):
        raise OrderNotFoundError(order_id=order_id)


def check_stock_availability(product_id: int, requested_quantity: int, available_quantity: int) -> None:
    """
    Check if sufficient stock is available for a product.

    Args:
        product_id: Product ID
        requested_quantity: Quantity requested
        available_quantity: Quantity available

    Raises:
        InsufficientStockError: If insufficient stock
    """
    if requested_quantity > available_quantity:
        raise InsufficientStockError(
            product_id=product_id,
            requested=requested_quantity,
            available=available_quantity
        )


def check_duplicate_enrollment(course_id: int, user_id: int, existing_enrollment: Optional[Any] = None) -> None:
    """
    Check for duplicate course enrollment.

    Args:
        course_id: Course ID
        user_id: User ID
        existing_enrollment: Existing enrollment data (optional)

    Raises:
        DuplicateEnrollmentError: If duplicate enrollment exists
    """
    if existing_enrollment is not None:
        raise DuplicateEnrollmentError(course_id=course_id, user_id=user_id)


def validate_role_transition(current_role: str, target_role: str, allowed_transitions: Dict[str, list]) -> None:
    """
    Validate role transition is allowed.

    Args:
        current_role: Current user role
        target_role: Target role to transition to
        allowed_transitions: Dictionary of allowed transitions

    Raises:
        InvalidRoleTransitionError: If transition is not allowed
    """
    if current_role not in allowed_transitions or target_role not in allowed_transitions[current_role]:
        raise InvalidRoleTransitionError(
            current_role=current_role,
            target_role=target_role
        )


def require_authentication(user: Optional[Any] = None) -> None:
    """
    Require user to be authenticated.

    Args:
        user: User object

    Raises:
        AuthenticationError: If user is not authenticated
    """
    if user is None:
        raise AuthenticationError(message="Authentication required")


def require_authorization(user: Any, required_permission: str, **context) -> None:
    """
    Require user to have specific permission.

    Args:
        user: User object
        required_permission: Required permission
        **context: Additional authorization context

    Raises:
        AuthorizationError: If user lacks permission
    """
    # This is a placeholder - implement actual permission checking logic
    # based on your authorization system
    if not hasattr(user, 'role') or not user.role:
        raise AuthorizationError(
            message=f"Permission '{required_permission}' required",
            details={"required_permission": required_permission, **context}
        )


def validate_file_upload(file: Any, allowed_types: list, max_size: int) -> None:
    """
    Validate file upload parameters.

    Args:
        file: File object
        allowed_types: List of allowed MIME types
        max_size: Maximum file size in bytes

    Raises:
        FileUploadError: If file validation fails
    """
    if hasattr(file, 'content_type') and file.content_type not in allowed_types:
        raise FileUploadError(
            message=f"File type '{file.content_type}' not allowed. Allowed types: {', '.join(allowed_types)}"
        )

    if hasattr(file, 'size') and file.size > max_size:
        raise FileUploadError(
            message=f"File size {file.size} bytes exceeds maximum allowed size of {max_size} bytes"
        )


def handle_external_service_error(service_name: str, error: Exception) -> ExternalServiceError:
    """
    Handle external service errors.

    Args:
        service_name: Name of the external service
        error: Original error

    Returns:
        ExternalServiceError instance
    """
    return ExternalServiceError(
        message=f"Error communicating with {service_name}",
        details={
            "service": service_name,
            "original_error": str(error),
            "error_type": type(error).__name__
        }
    )


def create_business_logic_error(message: str, **details) -> BusinessLogicError:
    """
    Create a business logic error.

    Args:
        message: Error message
        **details: Additional error details

    Returns:
        BusinessLogicError instance
    """
    return BusinessLogicError(message=message, details=details)
