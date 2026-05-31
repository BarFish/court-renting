'''Pydantic schemas for court-related API endpoints.'''

from pydantic import BaseModel, Field
from typing import Optional


class CourtOut(BaseModel):
    """Schema returned for a single court.

    Includes all columns from the ``courts`` table plus the primary key.
    """

    id: int
    name: str
    sport_type: str = Field(..., description="e.g. 'basketball', 'football', 'volleyball', 'multi-sport'")
    latitude: float
    longitude: float
    description: Optional[str] = None
    open_hour: int
    close_hour: int

    class Config:
        from_attributes = True


class NearbyRequest(BaseModel):
    """Request payload for the ``/courts/nearby`` endpoint.

    ``lat`` and ``lng`` are expected in decimal degrees.
    """

    lat: float
    lng: float
