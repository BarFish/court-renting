'''Database engine and Base model for SQLAlchemy.'''

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# Create the SQLAlchemy engine using the DATABASE_URL from environment variables
engine = create_engine(settings.database_url, echo=False, future=True)

# Base class for declarative class definitions
Base = declarative_base()
