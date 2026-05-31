'''Court‑related API routes.

- ``GET /courts/nearby`` – return courts ordered by distance from a lat/lng point.
- ``GET /courts/{id}`` – return a single court.
- ``GET /courts/{id}/availability`` – compute available hourly slots for a given date.
'''

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, not_, select
from datetime import date

from app import schemas
from app.db import session as db_session
from app.models import court as court_model, booking as booking_model

router = APIRouter(prefix="/courts", tags=["courts"])

# Dependency to get DB session
get_db = db_session.get_db

@router.get("/nearby", response_model=list[schemas.court.CourtOut])
def get_nearby_courts(
    lat: float = Query(..., description="Latitude in decimal degrees"),
    lng: float = Query(..., description="Longitude in decimal degrees"),
    db: Session = Depends(get_db),
):
    """Return courts ordered by distance from the supplied coordinates.

    Uses MySQL's ``ST_Distance_Sphere`` to compute great‑circle distance.
    """
    # MySQL expects POINT(lng, lat)
    user_point = func.ST_Point(lng, lat)
    distance_expr = func.ST_Distance_Sphere(func.ST_Point(court_model.Court.longitude, court_model.Court.latitude), user_point)
    courts = (
        db.query(court_model.Court)
        .order_by(distance_expr)
        .all()
    )
    return courts

@router.get("/{court_id}", response_model=schemas.court.CourtOut)
def get_court(court_id: int, db: Session = Depends(get_db)):
    cr = db.query(court_model.Court).filter(court_model.Court.id == court_id).first()
    if not cr:
        raise HTTPException(status_code=404, detail="Court not found")
    return cr

@router.get("/{court_id}/availability", response_model=schemas.booking.AvailabilityResponse)
def get_availability(
    court_id: int,
    date_str: str = Query(..., alias="date", description="YYYY‑MM‑DD"),
    db: Session = Depends(get_db),
):
    """Return hourly slots that are *not* already booked for the given court and date.
    """
    try:
        target_date = date.fromisoformat(date_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, expected YYYY-MM-DD")

    court = db.query(court_model.Court).filter(court_model.Court.id == court_id).first()
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")

    # All possible slots within open/close hours (close is exclusive)
    all_slots = list(range(court.open_hour, court.close_hour))

    # Fetch already booked slots for this court on the target date
    booked = (
        db.query(booking_model.Booking.time_slot)
        .filter(
            booking_model.Booking.court_id == court_id,
            booking_model.Booking.booking_date == target_date,
        )
        .all()
    )
    booked_slots = {b.time_slot for b in booked}
    available = [s for s in all_slots if s not in booked_slots]

    return schemas.booking.AvailabilityResponse(
        court_id=court_id,
        date=target_date,
        available_slots=available,
    )
