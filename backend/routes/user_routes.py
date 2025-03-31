from fastapi import APIRouter, HTTPException, status
from models import UserCreate, UserLogin
from controllers.user_controller import UserController

router = APIRouter()
controller = UserController()

@router.post("/register")
def register_user(user: UserCreate):
    """Register a new user."""
    return controller.register_user(user)

@router.post("/login")
async def login(user: UserLogin):
    """Authenticate a user and return an access token."""
    return await controller.login(user)  # Await the async method