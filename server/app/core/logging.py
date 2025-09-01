"""
Logging configuration for KFATS LMS application.
Provides structured logging with appropriate levels and formats.
"""

import logging
import logging.config
import sys
from pathlib import Path
from typing import Dict, Any

from .config import settings


def get_logging_config() -> Dict[str, Any]:
    """
    Get logging configuration dictionary.

    Returns:
        Dictionary containing logging configuration
    """
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    # Determine log level
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    # Base logging configuration
    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "detailed": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(request_id)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "simple": {
                "format": "%(asctime)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S"
            },
            "json": {
                "format": "%(asctime)s %(name)s %(levelname)s %(request_id)s %(message)s",
                "datefmt": "%Y-%m-%dT%H:%M:%S%z"
            }
        },
        "filters": {
            "request_id": {
                "()": "app.core.logging.RequestIdFilter"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": log_level,
                "formatter": "simple",
                "stream": sys.stdout,
                "filters": ["request_id"]
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": log_level,
                "formatter": "detailed",
                "filename": str(log_dir / "kfats.log"),
                "maxBytes": 10 * 1024 * 1024,  # 10MB
                "backupCount": 5,
                "filters": ["request_id"]
            },
            "error_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": logging.ERROR,
                "formatter": "detailed",
                "filename": str(log_dir / "kfats_error.log"),
                "maxBytes": 10 * 1024 * 1024,  # 10MB
                "backupCount": 5,
                "filters": ["request_id"]
            },
            "access_file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": logging.INFO,
                "formatter": "json",
                "filename": str(log_dir / "access.log"),
                "maxBytes": 50 * 1024 * 1024,  # 50MB
                "backupCount": 10,
                "filters": ["request_id"]
            }
        },
        "loggers": {
            "app": {
                "level": log_level,
                "handlers": ["console", "file", "error_file"],
                "propagate": False
            },
            "uvicorn": {
                "level": log_level,
                "handlers": ["console", "access_file"],
                "propagate": False
            },
            "uvicorn.access": {
                "level": log_level,
                "handlers": ["access_file"],
                "propagate": False
            },
            "sqlalchemy": {
                "level": logging.WARNING,
                "handlers": ["console", "file"],
                "propagate": False
            },
            "alembic": {
                "level": logging.INFO,
                "handlers": ["console", "file"],
                "propagate": False
            }
        },
        "root": {
            "level": log_level,
            "handlers": ["console", "file", "error_file"]
        }
    }

    return config


class RequestIdFilter(logging.Filter):
    """
    Logging filter to add request ID to log records.

    This filter looks for request_id in the logging context or thread-local storage.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        # Try to get request_id from record or thread local
        if not hasattr(record, 'request_id'):
            record.request_id = getattr(record, 'request_id', 'N/A')
        return True


def setup_logging() -> None:
    """
    Setup logging configuration for the application.

    This function should be called once during application startup.
    """
    config = get_logging_config()
    logging.config.dictConfig(config)

    # Set up root logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))

    # Log application startup
    startup_logger = logging.getLogger("app")
    startup_logger.info("KFATS LMS logging initialized")


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.

    Args:
        name: Logger name (usually __name__)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(f"app.{name}")


# Global logger instance for convenience
logger = get_logger(__name__)
