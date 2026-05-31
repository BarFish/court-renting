'''FastAPI application entry point – sets up CORS, includes routers, and creates DB tables on startup.'''

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import DB engine and Base for creating tables
from app.db.database import engine, Base

# Import API routers (auth, courts, bookings). These modules will be added in subsequent steps.
from app.api import auth, courts, bookings

# Create FastAPI instance
app = FastAPI(title="Court Renter API")

# Configure CORS – only allow the frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(courts.router)
app.include_router(bookings.router)

# Create database tables on startup
@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
