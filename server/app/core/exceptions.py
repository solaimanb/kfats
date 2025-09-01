"""
Custom exception classes for KFATS LMS application.
Provides domain-specific exceptions with proper error categorization.
"""

from typing import Any, Dict, Optional


class KFATSException(Exception):
    """
    Base exception class for all KFATS application errors.

    Attributes:
        message: Human-readable error message
        error_code: Machine-readable error code
        details: Additional error context
        status_code: HTTP status code to return
    """

    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        status_code: int = 500
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code or self.__class__.__name__
        self.details = details or {}
        self.status_code = status_code


class AuthenticationError(KFATSException):
    """Authentication-related errors (login, token validation, etc.)"""

    def __init__(self, message: str = "Authentication failed", **kwargs):
        super().__init__(message, status_code=401, **kwargs)


class AuthorizationError(KFATSException):
    """Authorization/permission errors"""

    def __init__(self, message: str = "Insufficient permissions", **kwargs):
        super().__init__(message, status_code=403, **kwargs)


class ValidationError(KFATSException):
    """Data validation errors"""

    def __init__(self, message: str = "Validation failed", **kwargs):
        super().__init__(message, status_code=400, **kwargs)


class DatabaseError(KFATSException):
    """Database operation errors"""

    def __init__(self, message: str = "Database operation failed", **kwargs):
        super().__init__(message, status_code=500, **kwargs)


class BusinessLogicError(KFATSException):
    """Business rule violations"""

    def __init__(self, message: str = "Business rule violation", **kwargs):
        super().__init__(message, status_code=409, **kwargs)


class ExternalServiceError(KFATSException):
    """External API/service errors"""

    def __init__(self, message: str = "External service error", **kwargs):
        super().__init__(message, status_code=502, **kwargs)


class NotFoundError(KFATSException):
    """Resource not found errors"""

    def __init__(self, message: str = "Resource not found", **kwargs):
        super().__init__(message, status_code=404, **kwargs)


class ConflictError(KFATSException):
    """Resource conflict errors"""

    def __init__(self, message: str = "Resource conflict", **kwargs):
        super().__init__(message, status_code=409, **kwargs)


class RateLimitError(KFATSException):
    """Rate limiting errors"""

    def __init__(self, message: str = "Rate limit exceeded", **kwargs):
        super().__init__(message, status_code=429, **kwargs)


# Specific domain errors
class UserNotFoundError(NotFoundError):
    """User not found"""

    def __init__(self, user_id: Optional[int] = None, **kwargs):
        message = f"User not found"
        if user_id:
            message = f"User with ID {user_id} not found"
        super().__init__(message, **kwargs)


class CourseNotFoundError(NotFoundError):
    """Course not found"""

    def __init__(self, course_id: Optional[int] = None, **kwargs):
        message = "Course not found"
        if course_id:
            message = f"Course with ID {course_id} not found"
        super().__init__(message, **kwargs)


class ArticleNotFoundError(NotFoundError):
    """Article not found"""

    def __init__(self, article_id: Optional[int] = None, **kwargs):
        message = "Article not found"
        if article_id:
            message = f"Article with ID {article_id} not found"
        super().__init__(message, **kwargs)


class ProductNotFoundError(NotFoundError):
    """Product not found"""

    def __init__(self, product_id: Optional[int] = None, **kwargs):
        message = "Product not found"
        if product_id:
            message = f"Product with ID {product_id} not found"
        super().__init__(message, **kwargs)


class OrderNotFoundError(NotFoundError):
    """Order not found"""

    def __init__(self, order_id: Optional[int] = None, **kwargs):
        message = "Order not found"
        if order_id:
            message = f"Order with ID {order_id} not found"
        super().__init__(message, **kwargs)


class InsufficientStockError(BusinessLogicError):
    """Insufficient product stock"""

    def __init__(self, product_id: int, requested: int, available: int, **kwargs):
        message = f"Insufficient stock for product {product_id}. Requested: {requested}, Available: {available}"
        super().__init__(message, **kwargs)


class DuplicateEnrollmentError(ConflictError):
    """Duplicate course enrollment"""

    def __init__(self, course_id: int, user_id: int, **kwargs):
        message = f"User {user_id} is already enrolled in course {course_id}"
        super().__init__(message, **kwargs)


class InvalidRoleTransitionError(BusinessLogicError):
    """Invalid role transition"""

    def __init__(self, current_role: str, target_role: str, **kwargs):
        message = f"Invalid role transition from {current_role} to {target_role}"
        super().__init__(message, **kwargs)


class PaymentRequiredError(KFATSException):
    """Payment required errors"""

    def __init__(self, message: str = "Payment required", **kwargs):
        super().__init__(message, status_code=402, **kwargs)


class FileUploadError(ValidationError):
    """File upload errors"""

    def __init__(self, message: str = "File upload failed", **kwargs):
        super().__init__(message, **kwargs)


class ConfigurationError(KFATSException):
    """Configuration errors"""

    def __init__(self, message: str = "Configuration error", **kwargs):
        super().__init__(message, status_code=500, **kwargs)
