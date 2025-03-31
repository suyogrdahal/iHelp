from fastapi import HTTPException, status
from db import help_collection
from models import HelpCreate, HelpUpdate
from pymongo.errors import PyMongoError
from bson import ObjectId  # Import ObjectId for handling MongoDB IDs

class HelpController:
    def create_help_request(self, help_request: HelpCreate):
        """Create a new help request."""
        try:
            new_help = help_request.dict()
            result = help_collection.insert_one(new_help)
            new_help["_id"] = str(result.inserted_id)  # Convert ObjectId to string
            return new_help
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )

    def get_help_requests(self):
        """Retrieve all help requests."""
        try:
            help_requests = list(help_collection.find())
            # Convert ObjectId to string for each document
            for help_request in help_requests:
                help_request["_id"] = str(help_request["_id"])
            return help_requests
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )

    def update_help_request(self, help_id: str, help_request: HelpUpdate):
        """Update an existing help request."""
        try:
            updated_data = help_request.dict(exclude_unset=True)
            # Convert help_id to ObjectId for MongoDB query
            result = help_collection.update_one(
                {"_id": ObjectId(help_id)}, {"$set": updated_data}
            )
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Help request not found"
                )
            return {"message": "Help request updated"}
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid help_id: {str(e)}"
            )

    def delete_help_request(self, help_id: str):
        """Delete a help request."""
        try:
            # Convert help_id to ObjectId for MongoDB query
            result = help_collection.delete_one({"_id": ObjectId(help_id)})
            if result.deleted_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Help request not found"
                )
            return {"message": "Help request deleted"}
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid help_id: {str(e)}"
            )