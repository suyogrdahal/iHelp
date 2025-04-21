from fastapi import HTTPException, status
from db import users_collection
from auth import verify_password, create_access_token
from pymongo.errors import PyMongoError
from datetime import timedelta
from email_util import EmailSender

class AdminController:
    async def login(self, user):
        existing_user = users_collection.find_one({"email": user.email})
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        if not verify_password(user.password, existing_user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        if existing_user["is_admin"] == False:
            raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin access only"
        )
        
        access_token_expires = timedelta(minutes=30) 
        access_token = create_access_token(
            data={"sub": user.email, "admin": "true"}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer", "email": user.email}
    