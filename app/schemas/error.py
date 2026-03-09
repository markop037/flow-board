from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standardized JSON error response for all API errors."""

    timestamp: str
    status: int
    error: str
    message: str
    path: str
