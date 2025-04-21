from fastapi import HTTPException, status
from db import help_collection, help_offer_collection, users_collection
from models import HelpCreate, HelpUpdate
from pymongo.errors import PyMongoError
from bson import ObjectId
from datetime import datetime
from controllers.user_controller import UserController

class HelpController:
   
    def create_help_request(self, help_request: HelpCreate, user_email: str):
        """Create a new help request."""
        try:
            new_help = help_request.dict()
            new_help["statuscode"] = "100"
            new_help["author"] = user_email  
            result = help_collection.insert_one(new_help)
            new_help["_id"] = str(result.inserted_id)
            return new_help
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )

    def get_help_requests(self, skip: int = 0, limit: int = 10, user_email: str = None):
        try:
            help_requests = list(
                help_collection.find(({"status": "active","statuscode": {"$in": ["100", "200"]}})).skip(skip).limit(limit)
            )
            for help_request in help_requests:
                help_request["_id"] = str(help_request["_id"])
                author_email = help_request.get("author")
                if author_email:
                    user = users_collection.find_one({"email": author_email})
                    help_request["author_name"] = user["first_name"] + " " + user["last_name"] if user else author_email
                if help_request.get("statuscode"):
                    match help_request["statuscode"]:
                        case "100":
                            help_request["status"] = "New"
                        case "200":
                            help_request["status"] = "Help Offered Not Accepted"
                        case "300":
                            help_request["status"] = "Help Accepted"
                        case _:
                            help_request["status"] = "Unknown Status"
                if user_email:
                    has_offered = help_offer_collection.find_one({
                        "help_id": help_request["_id"],
                        "giver_email": user_email
                    })
                    print(has_offered)
                    help_request["help_offered_by_me"] = bool(has_offered)
                else:
                    help_request["help_offered_by_me"] = False               
            return help_requests
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
    def get_my_help_requests(self, skip: int = 0, limit: int = 10, user_email: str = None):

        try:
            help_requests = list(
                help_collection.find(({"author": user_email})).skip(skip).limit(limit)
            )
            user = users_collection.find_one({"email": user_email})
            for help_request in help_requests:
                help_request["_id"] = str(help_request["_id"])
                author_email = help_request.get("author")
                help_request["author_name"] = user["first_name"] + " " + user["last_name"] if user else author_email
                if help_request.get("statuscode"):
                    match help_request["statuscode"]:
                        case "100":
                            help_request["status"] = "New"
                        case "200":
                            help_request["status"] = "Help Offered Not Accepted"
                        case "300":
                            help_request["status"] = "Help Accepted"
                        case "400":
                            help_request["status"] = "Help Completed"    
                        case _:
                            help_request["status"] = "Unknown Status"              
            return help_requests
        except PyMongoError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        

    def update_help_request(self, help_id: str, help_request: HelpUpdate, user_email: str):
        try:
            updated_data = help_request.dict(exclude_unset=True)
            result = help_collection.update_one(
                {"_id": ObjectId(help_id), "author": user_email},
                {"$set": updated_data}
            )
            if result.matched_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized or help request not found"
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

    def delete_help_request(self, help_id: str, user_email: str):
        """Delete a help request (only if owned by user)."""
        try:
            result = help_collection.delete_one(
                {"_id": ObjectId(help_id), "author": user_email}
            )
            if result.deleted_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized or help request not found"
                )
            help_offer_collection.delete_many({"help_id": ObjectId(help_id)})
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
        
    def send_help_offer(self, help_id: str, giver_email: str, comment: str = None):

            help_post = help_collection.find_one({"_id": ObjectId(help_id)})
            if not help_post:
                raise HTTPException(status_code=404, detail="Help request not found")
            if help_post.get("helped", True):
                raise HTTPException(status_code=400, detail="Help request already completed")
            existing_offer = help_offer_collection.find_one({
                "help_id": help_id,
                "giver_email": giver_email
            })
            if existing_offer:
                raise HTTPException(status_code=400, detail="You have already offered help for this post")

            offer = {
                "help_id": help_id,
                "giver_email": giver_email,
                "status": "pending",
                "timestamp": datetime.utcnow().isoformat(),
                "comment": comment,
            }
            update_helppost = help_collection.update_one(
                {"_id": ObjectId(help_id)},
                {"$set": {"statuscode": "200"}}
            )
            result = help_offer_collection.insert_one(offer)
            offer["_id"] = str(result.inserted_id)
            return offer

    def accept_help_offer(self, offer_id: str, author_email: str):

        offer = help_offer_collection.find_one({"_id": ObjectId(offer_id)})
        if not offer:
            raise HTTPException(status_code=404, detail="Help offer not found")

        help_post = help_collection.find_one({"_id": ObjectId(offer["help_id"])})
        if not help_post:
            raise HTTPException(status_code=404, detail="Related help request not found")
        if help_post.get("author") != author_email:
            raise HTTPException(status_code=403, detail="Not authorized")
        if help_post.get("helped", True):
            raise HTTPException(status_code=400, detail="Help already completed")

        # Accept this offer
        help_offer_collection.update_one(
            {"_id": ObjectId(offer_id)},
            {"$set": {"status": "accepted"}}
        )

        # Reject other offers
        help_offer_collection.update_many(
            {
                "help_id": offer["help_id"],
                "_id": {"$ne": ObjectId(offer_id)}
            },
            {"$set": {"status": "rejected"}}
        )

         
        help_collection.update_one(
            {"_id": ObjectId(offer["help_id"])},
            {
                "$set": {
                    "helper": offer["giver_email"],
                    "statuscode": "300" 
                }
            }
        )

        return {"message": "Help offer accepted and help request closed."}
    
    def check_help_offer_status(self, help_id: str, user_email: str):
        try:
            offer = help_offer_collection.find_one({
                "help_id": help_id,
                "giver_email": user_email
            })
            if not offer:
                raise HTTPException(status_code=404, detail="No help offer found for this post")

            return {
                "status": offer.get("status", "pending"),
                "comment": offer.get("comment", ""),
                "timestamp": offer.get("timestamp", "")
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error checking offer status: {str(e)}")
    
    def get_help_offers_for_post(self, help_id: str, user_email: str):
        try:
            help_post = help_collection.find_one({"_id": ObjectId(help_id)})
            if not help_post:
                raise HTTPException(status_code=404, detail="Help post not found")
            
            if help_post.get("author") != user_email:
                raise HTTPException(status_code=403, detail="Not authorized to view offers for this post")

            offers = list(help_offer_collection.find({"help_id": help_id}))
            for offer in offers:
                offer["_id"] = str(offer["_id"])
                for offer in offers:
                    offer["_id"] = str(offer["_id"])
                    
                    user = users_collection.find_one({"email": offer.get("giver_email")})
                    if user:
                        first = user.get("first_name", "")
                        last = user.get("last_name", "")
                        offer["full_name"] = f"{first} {last}".strip()
                    else:
                        offer["full_name"] = offer.get("giver_email")
            return offers
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error retrieving help offers: {str(e)}")

    def get_helper_info(self, help_id: str, user_email: str):
        help_post = help_collection.find_one({"_id": ObjectId(help_id)})
        if not help_post:
            raise HTTPException(status_code=404, detail="Help post not found")

        if help_post.get("author") != user_email:
            raise HTTPException(status_code=403, detail="Not authorized to view helper info")

        helper_email = help_post.get("helper")
        if not helper_email:
            raise HTTPException(status_code=404, detail="No helper has been assigned to this post")

        user = users_collection.find_one({"email": helper_email})
        if not user:
            raise HTTPException(status_code=404, detail="Helper not found")

        return {
            "email": user.get("email"),
            "first_name": user.get("first_name", ""),
            "last_name": user.get("last_name", ""),
            "phone_number": user.get("phone_number", "")
        }

    def view_my_help_offers(self, user_email: str):
        try:
            usercontroller = UserController()
            offers = list(help_offer_collection.find({"giver_email": user_email}))
            for offer in offers:
                offer["_id"] = str(offer["_id"])
                help_post = help_collection.find_one({"_id": ObjectId(offer["help_id"])})

                if help_post:
                    offer["help_id"] = str(help_post["_id"])  # convert to string
                    offer["help_heading"] = help_post.get("heading", "")
                    offer["help_content"] = help_post.get("content", "")
                    offer["help_statuscode"] = help_post.get("statuscode", "")
                    offer["help_timestamp"] = help_post.get("timestamp", "")
                    offer["help_author_name"] = usercontroller.get_full_name_by_email(help_post.get("author",""))
                    offer["helpasker"] = help_post.get("author")
            return offers
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error retrieving your help offers: {str(e)}")
