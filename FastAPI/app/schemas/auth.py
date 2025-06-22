from pydantic import BaseModel, validator
from typing import Optional
from app.models import RoleEnum

class UserRegister(BaseModel):
    nim: str
    name: str
    kode_akses: str
    
    @validator('nim')
    def validate_nim(cls, v):
        from app.auth import validate_nim_format
        
        result = validate_nim_format(v)
        if not result['valid']:
            raise ValueError(result['error'])
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Nama minimal 2 karakter')
        return v.strip().title()
    
    @validator('kode_akses')
    def validate_kode_akses(cls, v):
        if len(v) < 6:
            raise ValueError('Kode akses minimal 6 karakter')
        return v

class UserLogin(BaseModel):
    nim: str
    kode_akses: str

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: 'UserResponse'

class UserResponse(BaseModel):
    id: int
    nim: str
    name: str
    role: RoleEnum
    created_at: str  # tipe tetap string!

    class Config:
        from_attributes = True

    @validator("created_at", pre=True)
    def serialize_created_at(cls, v):
        if hasattr(v, "isoformat"):
            return v.isoformat()
        return str(v)

# Update forward reference
Token.model_rebuild()