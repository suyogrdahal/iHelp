
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from db import users_collection

# JWT Secret Key and Algorithm
SECRET_KEY = "iHelp"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT token with a set expiration time"""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)  
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

class UserLogin(BaseModel):
    email: str
    password: str



def get_current_user(authorization: Optional[str] = Header(default=None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = users_collection.find_one({"email": email})
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        if user.get("is_admin"):
            raise HTTPException(status_code=401, detail="Normal user access only")
        return payload["sub"]
    
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
def get_current_admin(authorization: Optional[str] = Header(default=None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user = users_collection.find_one({"email": email})
        if user and user.get("is_admin"):
            return payload["sub"]
        else:
            raise HTTPException(status_code=401, detail="Not an admin")
    
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
   
