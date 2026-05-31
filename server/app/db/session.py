'''SQLAlchemy session management for FastAPI dependencies.'''

from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import Session as SessionType

from app.db.database import engine

# Create a configured "SessionLocal" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to be used in FastAPI routes
def get_db() -> SessionType:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
