from fastapi import APIRouter, Depends, HTTPException, status
from models import HelpCreate, HelpUpdate, HelpOfferCreate
from controllers.help_controller import HelpController
from auth import get_current_user

router = APIRouter()
controller = HelpController()

@router.post("/create", status_code=201)
def create_help_request(help_request: HelpCreate, user_email: str = Depends(get_current_user)):
    return controller.create_help_request(help_request, user_email)

@router.get("/get")
def get_help_requests(skip: int = 0, limit: int = 10):
    return controller.get_help_requests(skip=skip, limit=limit, user_email="")

@router.get("/getmyhelp")
def get_help_requests(skip: int = 0, limit: int = 10, user_email: str = Depends(get_current_user)):
    return controller.get_my_help_requests(skip=skip, limit=limit, user_email=user_email)

@router.get("/getwithauth")
def get_help_requests(skip: int = 0, limit: int = 10,user_email: str = Depends(get_current_user)):
    return controller.get_help_requests(skip=skip, limit=limit, user_email=user_email)

@router.post("/edit/{help_id}")
def update_help_request(help_id: str, help_request: HelpUpdate, user_email: str = Depends(get_current_user)):
    return controller.update_help_request(help_id, help_request, user_email)

@router.delete("/delete/{help_id}", status_code=204)
def delete_help_request(help_id: str, user_email: str = Depends(get_current_user)):
    controller.delete_help_request(help_id, user_email)
    return {"message": "Help request deleted"}

@router.post("/offer/{help_id}")
def send_help_offer(help_id: str, offer_data: HelpOfferCreate,user_email: str = Depends(get_current_user)):
    return controller.send_help_offer(help_id, user_email, offer_data.comment)

@router.post("/offer/accept/{offer_id}")
def accept_help_offer(offer_id: str, user_email: str = Depends(get_current_user)):
    return controller.accept_help_offer(offer_id, user_email)

@router.get("/offer/status/{help_id}")
def check_help_offer_status(help_id: str, user_email: str = Depends(get_current_user)):
    return controller.check_help_offer_status(help_id, user_email)

@router.get("/offers/{help_id}")
def get_help_offers_for_post(help_id: str, user_email: str = Depends(get_current_user)):
    return controller.get_help_offers_for_post(help_id, user_email)

@router.get("/helper-info/{help_id}")
def get_helper_info(help_id: str, user_email: str = Depends(get_current_user)):
    return controller.get_helper_info(help_id, user_email)

@router.get("/my-offers")
def view_my_help_offers(user_email: str = Depends(get_current_user)):
    return controller.view_my_help_offers(user_email)