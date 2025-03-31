from fastapi import HTTPException, status
from db import users_collection
from auth import hash_password, verify_password, create_access_token
from pymongo.errors import PyMongoError
from datetime import timedelta

class UserController:
    def register_user(self, user):
        """Register a new user."""
        try:
            # Check if the user already exists
            existing_user = users_collection.find_one({"email": user.email})
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            
            # Create a new user
            new_user = {
                "email": user.email,
                "hashed_password": hash_password(user.password),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "program_level": user.program_level,
                "program": user.program,
                "address": user.address,
                "phone_number": user.phone_number
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
        return {"message": "User registered successfully"}

    async def login(self, user):
        """Authenticate a user and return an access token."""
        # Check if the user exists in the database
        existing_user = users_collection.find_one({"email": user.email})
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Verify the password
        if not verify_password(user.password, existing_user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Create the access token
        access_token_expires = timedelta(minutes=30)  # Customize as needed
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}