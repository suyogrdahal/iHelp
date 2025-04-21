from fastapi import FastAPI, APIRouter, HTTPException
from routes.user_routes import router as user_router
from routes.help_routes import router as help_router
from routes.admin_routes import router as admin_router
from dotenv import load_dotenv
import os

load_dotenv()

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS").split(",")  

app = FastAPI()

app.include_router(user_router,prefix="/user")
app.include_router(help_router,prefix="/help")
app.include_router(admin_router,prefix="/admin")


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

@app.get("/")
def index():
    return "Hello World!"
