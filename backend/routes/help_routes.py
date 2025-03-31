from fastapi import APIRouter, HTTPException, status
from models import HelpCreate, HelpUpdate
from controllers.help_controller import HelpController

router = APIRouter()
controller = HelpController()

@router.post("/create", status_code=201)
def create_help_request(help_request: HelpCreate):
    """Create a new help request."""
    return controller.create_help_request(help_request)

@router.get("/get")
def get_help_requests():
    """Retrieve all help requests."""
    return controller.get_help_requests()

@router.post("/edit/{help_id}")
def update_help_request(help_id: str, help_request: HelpUpdate):
    """Update an existing help request."""
    return controller.update_help_request(help_id, help_request)

@router.delete("/delete/{help_id}", status_code=204)
def delete_help_request(help_id: str):
    """Delete a help request."""
    controller.delete_help_request(help_id)
    return {"message": "Help request deleted"}