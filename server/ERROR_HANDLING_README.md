# KFATS LMS - Enhanced Error Handling System

## Overview

Phase 2 of the KFATS LMS development has implemented a comprehensive, production-ready error handling system that provides:

- **Custom Exception Classes**: Domain-specific exceptions with proper categorization
- **Centralized Error Handlers**: Consistent error response formatting and logging
- **Middleware Integration**: Request logging, security headers, and rate limiting
- **Structured Logging**: Comprehensive logging with proper levels and formats
- **Utility Functions**: Helper functions for common error handling patterns

## Architecture

### Core Components

#### 1. Custom Exceptions (`app/core/exceptions.py`)
- `KFATSException`: Base exception class for all application errors
- Domain-specific exceptions: `UserNotFoundError`, `CourseNotFoundError`, etc.
- Proper HTTP status code mapping and error categorization

#### 2. Error Handlers (`app/core/error_handlers.py`)
- Centralized exception handling for all error types
- Standardized JSON error responses
- Comprehensive logging integration
- Handles FastAPI, Pydantic, SQLAlchemy, and custom exceptions

#### 3. Middleware (`app/core/middleware.py`)
- `RequestLoggingMiddleware`: Logs all requests with timing and context
- `SecurityHeadersMiddleware`: Adds security-related HTTP headers
- `RateLimitMiddleware`: Basic rate limiting functionality
- `CORSMiddleware`: Cross-origin request handling

#### 4. Logging System (`app/core/logging.py`)
- Structured logging with JSON format for production
- Rotating file handlers with size limits
- Request ID tracking across log entries
- Configurable log levels and formats

#### 5. Error Utilities (`app/core/error_utils.py`)
- Helper functions for common error handling patterns
- Database error translation
- Resource existence validation
- Business logic validation

## Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "specific_field",
      "additional_context": "value"
    }
  }
}
```

## Exception Types

### Base Exceptions
- `KFATSException`: Base class for all custom exceptions
- `AuthenticationError`: Login/token validation failures (401)
- `AuthorizationError`: Permission/access control failures (403)
- `ValidationError`: Data validation failures (400)
- `DatabaseError`: Database operation failures (500)
- `BusinessLogicError`: Business rule violations (409)
- `NotFoundError`: Resource not found (404)
- `ConflictError`: Resource conflicts (409)

### Domain-Specific Exceptions
- `UserNotFoundError`: User resource not found
- `CourseNotFoundError`: Course resource not found
- `ArticleNotFoundError`: Article resource not found
- `ProductNotFoundError`: Product resource not found
- `OrderNotFoundError`: Order resource not found
- `InsufficientStockError`: Product stock validation
- `DuplicateEnrollmentError`: Course enrollment conflicts
- `InvalidRoleTransitionError`: Role change validation

## Usage Examples

### Basic Exception Usage

```python
from app.core.exceptions import UserNotFoundError, ValidationError

# Raise domain-specific exception
if not user:
    raise UserNotFoundError(user_id=user_id)

# Raise validation error
if not valid_email(email):
    raise ValidationError(
        message="Invalid email format",
        details={"field": "email", "value": email}
    )
```

### Using Error Utilities

```python
from app.core.error_utils import ensure_user_exists, handle_database_error

# Validate resource existence
ensure_user_exists(user_id, user_data)

# Handle database errors
try:
    await db.commit()
except SQLAlchemyError as e:
    handle_database_error(e)
```

### Router Integration

```python
from app.core.exceptions import ConflictError
from app.core.error_utils import ensure_user_exists, create_business_logic_error

@router.put("/users/{user_id}")
async def update_user(user_id: int, update_data: UserUpdate, db: AsyncSession):
    try:
        # Validate user exists
        user = await db.get(User, user_id)
        ensure_user_exists(user_id, user)

        # Check for conflicts
        if update_data.username:
            existing = await db.query(User).filter(
                User.username == update_data.username,
                User.id != user_id
            ).first()
            if existing:
                raise ConflictError(
                    message="Username already taken",
                    details={"field": "username", "value": update_data.username}
                )

        # Update user
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(user, field, value)

        await db.commit()
        return User.model_validate(user)

    except ConflictError:
        raise  # Re-raise custom exceptions
    except Exception as e:
        await db.rollback()
        handle_database_error(e)
```

## Configuration

### Environment Variables

```bash
# Logging
LOG_LEVEL=INFO
LOG_FORMAT="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_FILE=logs/kfats.log
LOG_MAX_SIZE=10485760  # 10MB
LOG_BACKUP_COUNT=5

# Rate Limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

### Log Files

The system creates the following log files in the `logs/` directory:
- `kfats.log`: Main application logs
- `kfats_error.log`: Error-only logs
- `access.log`: HTTP access logs

## Middleware Order

Middleware is applied in the following order (important for proper functioning):

1. `RequestLoggingMiddleware` - Logs incoming requests
2. `SecurityHeadersMiddleware` - Adds security headers
3. `RateLimitMiddleware` - Enforces rate limits
4. `CORSMiddleware` - Handles CORS (original FastAPI middleware)

## Error Handler Priority

Exception handlers are registered in order of specificity:

1. `KFATSException` - Custom application exceptions
2. `HTTPException` - FastAPI HTTP exceptions
3. `StarletteHTTPException` - Starlette HTTP exceptions
4. `PydanticValidationError` - Request validation errors
5. `SQLAlchemyError` - Database errors
6. `Exception` - Catch-all for unexpected errors

## Best Practices

### 1. Use Custom Exceptions
```python
# ✅ Good
raise UserNotFoundError(user_id=user_id)

# ❌ Avoid
raise HTTPException(status_code=404, detail="User not found")
```

### 2. Provide Context
```python
# ✅ Good
raise ValidationError(
    message="Invalid course price",
    details={
        "field": "price",
        "provided_value": price,
        "expected_range": "0-10000"
    }
)
```

### 3. Handle Database Errors
```python
# ✅ Good
try:
    await db.commit()
except SQLAlchemyError as e:
    handle_database_error(e)
```

### 4. Validate Resources Early
```python
# ✅ Good
ensure_user_exists(user_id, user_data)
ensure_course_exists(course_id, course_data)
```

### 5. Use Business Logic Errors
```python
# ✅ Good
if user.role == UserRole.ADMIN:
    raise create_business_logic_error(
        "Cannot delete admin users",
        user_id=user_id,
        user_role=user.role.value
    )
```

## Migration Guide

### From HTTPException to Custom Exceptions

**Before:**
```python
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="User not found"
)
```

**After:**
```python
raise UserNotFoundError(user_id=user_id)
```

### Adding Error Handling to Existing Routes

1. Import required modules:
```python
from app.core.exceptions import UserNotFoundError, ValidationError
from app.core.error_utils import ensure_user_exists, handle_database_error
```

2. Wrap database operations:
```python
try:
    user = await db.get(User, user_id)
    ensure_user_exists(user_id, user)
    # ... rest of logic
except Exception as e:
    handle_database_error(e)
```

3. Replace HTTPException with custom exceptions:
```python
# Replace this:
raise HTTPException(status_code=400, detail="Invalid data")

# With this:
raise ValidationError(message="Invalid data", details={"field": "data"})
```

## Testing Error Handling

### Unit Tests
```python
def test_user_not_found_error():
    with pytest.raises(UserNotFoundError) as exc_info:
        raise UserNotFoundError(user_id=123)

    assert exc_info.value.status_code == 404
    assert exc_info.value.error_code == "UserNotFoundError"
    assert exc_info.value.details["user_id"] == 123
```

### Integration Tests
```python
async def test_get_nonexistent_user(client):
    response = await client.get("/api/v1/users/99999")

    assert response.status_code == 404
    data = response.json()
    assert not data["success"]
    assert data["error"]["code"] == "UserNotFoundError"
```

## Monitoring and Alerting

### Log Analysis
- Monitor error logs for patterns
- Set up alerts for critical errors
- Track error rates by endpoint

### Metrics
- Error count by type
- Response time degradation
- Database error frequency

## Performance Considerations

- Logging is asynchronous and non-blocking
- Error handlers are lightweight
- Rate limiting uses in-memory storage (consider Redis for production)
- File logging with rotation prevents disk space issues

## Security Considerations

- Error messages don't leak sensitive information
- Request IDs help track malicious requests
- Security headers prevent common attacks
- Rate limiting prevents abuse

## Future Enhancements

- Integration with error monitoring services (Sentry, Rollbar)
- Distributed tracing support
- Custom error pages for web clients
- Error analytics dashboard
- Automated error reporting

---

This error handling system provides a solid foundation for production applications with proper error categorization, consistent responses, comprehensive logging, and excellent developer experience.
