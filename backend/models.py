import re
from pydantic import BaseModel, EmailStr, field_validator
from fastapi import HTTPException, status
from typing import Optional

class UserCreate(BaseModel):

    email: EmailStr
    password: str
    first_name: str
    last_name: str
    program_level: str 
    program: str
    address: str
    phone_number: str

    @field_validator("email")
    @classmethod
    def validate_gvsu_email(cls, v):
        if not v.endswith("@mail.gvsu.edu"):
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Only GVSU email addresses are allowed'
            )           
        return v
      
    @field_validator('program_level')
    @classmethod
    def validate_program_level(cls, v):
        if v not in ['undergrad', 'grad']:
            raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Program level must be either "Undergraduate" or "Graduate"'
            )
        return v
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        phone_pattern = re.compile(r'^\(\d{3}\) \d{3}-\d{4}$')
        if not phone_pattern.match(v):
            raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Phone number must be in the format (XXX) XXX-XXXX"
        )
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class HelpCreate(BaseModel):
    heading: str
    content: str
    author: str
    status: Optional[str] = "active"  # Default to "active"
    helped: Optional[bool] = False  # Default to "not helped"
    helper: Optional[str] = None
    timestamp: Optional[str] = None

class HelpUpdate(BaseModel):
    heading: Optional[str]
    content: Optional[str]
    status: Optional[str]
    helped: Optional[bool]
    helper: Optional[str]