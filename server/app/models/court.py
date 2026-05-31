'''SQLAlchemy ORM model for courts.'''

from sqlalchemy import Column, Integer, String, Text, DECIMAL

from app.db.database import Base

class Court(Base):
    __tablename__ = "courts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sport_type = Column(String, nullable=False)
    latitude = Column(DECIMAL(9, 6), nullable=False)
    longitude = Column(DECIMAL(9, 6), nullable=False)
    description = Column(Text, nullable=True)
    open_hour = Column(Integer, nullable=False)
    close_hour = Column(Integer, nullable=False)
