"""Global exception handlers for standardized JSON error responses."""

from datetime import datetime, timezone
from http import HTTPStatus
from typing import Any

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


def _status_phrase(code: int) -> str:
    """Return standard HTTP status phrase for a status code."""
    try:
        return HTTPStatus(code).phrase
    except ValueError:
        return str(code)


def _error_payload(
    *,
    status_code: int,
    error: str,
    message: str,
    path: str,
) -> dict[str, Any]:
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": status_code,
        "error": error,
        "message": message,
        "path": path,
    }


def _format_validation_errors(exc: RequestValidationError) -> str:
    """Turn Pydantic validation errors into a single readable message."""
    parts = []
    for err in exc.errors():
        loc = ".".join(str(x) for x in err.get("loc", ()) if x != "body")
        msg = err.get("msg", "Validation error")
        if loc:
            parts.append(f"{loc}: {msg}")
        else:
            parts.append(msg)
    return "; ".join(parts) if parts else "Validation error"


async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    """Handle HTTPException (including 404) with standardized JSON."""
    detail = exc.detail
    if isinstance(detail, (list, dict)):
        message = str(detail)
    else:
        message = str(detail) if detail else exc.status_code
    error_phrase = _status_phrase(exc.status_code)
    payload = _error_payload(
        status_code=exc.status_code,
        error=error_phrase,
        message=message,
        path=request.url.path,
    )
    return JSONResponse(status_code=exc.status_code, content=payload)


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """Handle request validation errors (body/query/path) with standardized JSON."""
    message = _format_validation_errors(exc)
    payload = _error_payload(
        status_code=status.HTTP_400_BAD_REQUEST,
        error="Bad Request",
        message=message,
        path=request.url.path,
    )
    return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=payload)
