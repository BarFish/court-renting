'''SQLAlchemy ORM model for bookings with composite unique constraint.'''

from sqlalchemy import Column, Integer, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.database import Base

class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        UniqueConstraint("court_id", "booking_date", "time_slot", name="uq_court_date_slot"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    court_id = Column(Integer, ForeignKey("courts.id"), nullable=False)
    booking_date = Column(Date, nullable=False)
    time_slot = Column(Integer, nullable=False)  # hour of the day, e.g., 10 for 10:00-11:00

    # Relationships (optional but useful)
    user = relationship("User", backref="bookings")
    court = relationship("Court", backref="bookings")
