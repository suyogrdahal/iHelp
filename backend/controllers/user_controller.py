from fastapi import HTTPException, status
from db import users_collection
from auth import hash_password, verify_password, create_access_token
from pymongo.errors import PyMongoError
from datetime import timedelta
import random
import string
from email_util import EmailSender

class UserController:
    def register_user(self, user):
        """Register a new user."""
        try:
            # Check if the user already exists
            existing_user = users_collection.find_one({"email": user.email})
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            verification_token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
            # Create a new user
            new_user = {
                "email": user.email,
                "hashed_password": hash_password(user.password),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "program_level": user.program_level,
                "program": user.program,
                "address": user.address,
                "phone_number": user.phone_number,
                "verified": False,
                "verification_token": verification_token,
            }
            users_collection.insert_one(new_user)
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"An error occurred: {str(e)}"
            )
        email_sender = EmailSender()
        verification_link = f"/verify?email={user.email}&verification_token={verification_token}"
        email_sender.send_verification_email(user.email, verification_link)
        return {"message": "User registered successfully"}

    async def login(self, user):
        # Check if the user exists in the database
        existing_user = users_collection.find_one({"email": user.email})
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        if existing_user["verified"] == False:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not verified. Please verify with the link sent to your email."
            )
        # Verify the password
        if not verify_password(user.password, existing_user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        access_token_expires = timedelta(minutes=30) 
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer", "email": user.email}
    
    def verify_user(self, email:str, verification_token: str):
        
        try:
            user = users_collection.find_one({"verification_token": verification_token, "email": email})
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Invalid verification token"
                )
            users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"verified": True}, "$unset": {"verification_token": ""}}  # Remove the token after verification
            )
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        return {"message": "User verified successfully"}
    
    def get_full_name_by_email(self,email: str) -> str:
        user = users_collection.find_one({"email": email})
        if user:
            first = user.get("first_name", "")
            last = user.get("last_name", "")
            return f"{first} {last}".strip()
        return email