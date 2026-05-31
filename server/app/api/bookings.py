'''Booking‑related API routes.

- ``POST /bookings/`` – create a new booking (authenticated).
- ``GET /bookings/me`` – list current user’s bookings (authenticated).
- ``DELETE /bookings/{id}`` – cancel a booking with ownership and 24‑hour window checks (authenticated).
'''

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta, date

from app import schemas
from app.core import security
from app.db import session as db_session
from app.models import booking as booking_model, court as court_model, user as user_model

router = APIRouter(prefix="/bookings", tags=["bookings"])

# Dependency to get DB session
get_db = db_session.get_db

# Dependency to get current user from token (reuse from auth module)
from app.api.auth import get_current_user

@router.post("/", response_model=schemas.booking.BookingOut, status_code=201)
def create_booking(
    booking_in: schemas.booking.BookingCreate,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    # Verify court exists
    court = db.query(court_model.Court).filter(court_model.Court.id == booking_in.court_id).first()
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")

    # Ensure the requested slot is within court operating hours
    if booking_in.time_slot < court.open_hour or booking_in.time_slot >= court.close_hour:
        raise HTTPException(status_code=400, detail="Requested time slot is outside court operating hours")

    new_booking = booking_model.Booking(
        user_id=current_user.id,
        court_id=booking_in.court_id,
        booking_date=booking_in.booking_date,
        time_slot=booking_in.time_slot,
    )
    db.add(new_booking)
    try:
        db.commit()
        db.refresh(new_booking)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="This slot is already booked.")

    # Return enriched booking info (court name + sport_type)
    return schemas.booking.BookingOut(
        id=new_booking.id,
        court_id=new_booking.court_id,
        booking_date=new_booking.booking_date,
        time_slot=new_booking.time_slot,
        court_name=court.name,
        sport_type=court.sport_type,
    )

@router.get("/me", response_model=list[schemas.booking.BookingOut])
def list_my_bookings(
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    bookings = (
        db.query(booking_model.Booking, court_model.Court)
        .join(court_model.Court, booking_model.Booking.court_id == court_model.Court.id)
        .filter(booking_model.Booking.user_id == current_user.id)
        .all()
    )
    result = []
    for b, c in bookings:
        result.append(
            schemas.booking.BookingOut(
                id=b.id,
                court_id=b.court_id,
                booking_date=b.booking_date,
                time_slot=b.time_slot,
                court_name=c.name,
                sport_type=c.sport_type,
            )
        )
    return result

@router.delete("/{booking_id}", status_code=204)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: user_model.User = Depends(get_current_user),
):
    booking = db.query(booking_model.Booking).filter(booking_model.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own bookings")

    # Check 24‑hour cancellation window
    booking_datetime = datetime.combine(booking.booking_date, datetime.min.time()) + timedelta(hours=booking.time_slot)
    if booking_datetime - datetime.utcnow() < timedelta(hours=24):
        raise HTTPException(status_code=403, detail="Cancellations must be made at least 24 hours before the slot.")

    db.delete(booking)
    db.commit()
    return
