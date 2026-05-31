'''Authentication API routes (register, login, me).'''

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app import schemas
from app.core import security
from app.db import session as db_session
from app.models import user as user_model
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Dependency to get DB session
get_db = db_session.get_db

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> user_model.User:
    try:
        token_data = security.decode_access_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(user_model.User).filter(user_model.User.email == token_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/register", response_model=schemas.auth.UserOut, status_code=201)
def register(user_in: schemas.auth.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(user_model.User).filter(user_model.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    hashed = security.hash_password(user_in.password)
    db_user = user_model.User(email=user_in.email, hashed_password=hashed)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=schemas.auth.Token)
def login(form_data: schemas.auth.UserCreate, db: Session = Depends(get_db)):
    user = db.query(user_model.User).filter(user_model.User.email == form_data.email).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials", headers={"WWW-Authenticate": "Bearer"})
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = security.create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
    return schemas.auth.Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=schemas.auth.UserOut)
def read_current_user(current_user: user_model.User = Depends(get_current_user)):
    return current_user
