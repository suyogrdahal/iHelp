from fastapi import APIRouter, HTTPException, status,Depends
from models import UserLogin
from controllers.admin_controller import AdminController
from auth import get_current_admin
from db import users_collection, help_collection
from pymongo import ASCENDING
from bson.son import SON

router = APIRouter()
controller = AdminController()


@router.post("/login")
async def login(user: UserLogin):
    return await controller.login(user)  

@router.get("/user-count")
def get_user_count(user=Depends(get_current_admin)):
    count = users_collection.count_documents({})
    return {"count": count}


@router.get("/help-posts-by-date")
def help_posts_by_date(user=Depends(get_current_admin)):
    pipeline = [
    {
        "$match": {
            "timestamp": {"$type": "date"} 
        }
    },
    {
        "$project": {
            "date": {
                "$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}
            }
        }
    },
    {
        "$group": {
            "_id": "$date",
            "count": {"$sum": 1}
        }
    },
    {
        "$sort": {"_id": 1}
    }
    ]

    results = list(help_collection.aggregate(pipeline))
    return [{"date": r["_id"], "count": r["count"]} for r in results]