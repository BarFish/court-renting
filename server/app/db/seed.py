'''Idempotent seed script for demo courts.

Creates a set of predefined courts if they do not already exist.
'''

from sqlalchemy.orm import Session

from app.models import court as court_model

# List of court data dictionaries
COURTS = [
    {
        "name": "Tel Aviv Beach Basketball Court",
        "sport_type": "basketball",
        "latitude": 32.0809,
        "longitude": 34.7700,
        "description": "Beachside basketball court with sea view.",
        "open_hour": 7,
        "close_hour": 22,
    },
    {
        "name": "Ramat Gan Football Arena",
        "sport_type": "football",
        "latitude": 32.0682,
        "longitude": 34.8200,
        "description": "Large football arena in Ramat Gan.",
        "open_hour": 8,
        "close_hour": 23,
    },
    {
        "name": "HaYarkon Volleyball Park",
        "sport_type": "volleyball",
        "latitude": 32.0800,
        "longitude": 34.8000,
        "description": "Volleyball courts near HaYarkon park.",
        "open_hour": 9,
        "close_hour": 21,
    },
    {
        "name": "Central Multi-Sport Complex",
        "sport_type": "multi-sport",
        "latitude": 32.0750,
        "longitude": 34.7850,
        "description": "Basketball, football and volleyball facilities.",
        "open_hour": 6,
        "close_hour": 24,
    },
    {
        "name": "Jaffa Football Ground",
        "sport_type": "football",
        "latitude": 32.0510,
        "longitude": 34.7490,
        "description": "Historic football ground in Jaffa.",
        "open_hour": 8,
        "close_hour": 22,
    },
    {
        "name": "North Tel Aviv Volleyball Club",
        "sport_type": "volleyball",
        "latitude": 32.1100,
        "longitude": 34.7700,
        "description": "Club with indoor and outdoor courts.",
        "open_hour": 8,
        "close_hour": 21,
    },
    {
        "name": "Bat Yam Multi-Sport Center",
        "sport_type": "multi-sport",
        "latitude": 32.0110,
        "longitude": 34.7470,
        "description": "Multi‑sport center serving Bat Yam residents.",
        "open_hour": 7,
        "close_hour": 23,
    },
]


def seed_courts(db: Session) -> None:
    """Insert courts into the database if they are not already present.

    The function is idempotent: it checks for an existing court by name before
    inserting. This allows the script to be run multiple times safely.
    """
    for data in COURTS:
        exists = db.query(court_model.Court).filter(court_model.Court.name == data["name"]).first()
        if not exists:
            court = court_model.Court(**data)
            db.add(court)
    db.commit()


# Helper for direct execution (e.g., python -m server.app.db.seed)
if __name__ == "__main__":
    from app.db.session import SessionLocal
    with SessionLocal() as session:
        seed_courts(session)
        print("Seed data inserted (if not already present).")
