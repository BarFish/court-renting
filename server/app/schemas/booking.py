'''Pydantic schemas for booking-related API endpoints.'''

from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class BookingCreate(BaseModel):
    """Payload for creating a new booking.

    ``court_id`` – ID of the court to book.
    ``booking_date`` – Date of the booking (YYYY‑MM‑DD).
    ``time_slot`` – Hour of the day (e.g., ``10`` for 10:00‑11:00).
    """

    court_id: int
    booking_date: date
    time_slot: int = Field(..., ge=0, le=23, description="Hour of the day, 0‑23 inclusive")


class BookingOut(BaseModel):
    """Schema returned for a user's booking record.

    Includes the booking ID and related court information for convenience.
    """

    id: int
    court_id: int
    booking_date: date
    time_slot: int
    court_name: Optional[str] = None
    sport_type: Optional[str] = None

    class Config:
        from_attributes = True


class AvailabilityResponse(BaseModel):
    """Response for the ``/courts/{id}/availability`` endpoint.

    ``available_slots`` contains the list of open hour integers that are *not* already booked for the given date.
    """

    court_id: int
    date: date
    available_slots: List[int]
