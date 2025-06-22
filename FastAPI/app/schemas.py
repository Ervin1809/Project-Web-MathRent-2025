from pydantic import BaseModel
from enum import Enum

class RoleEnum(str, Enum):
    mahasiswa = "mahasiswa"
    staff = "staff"

class UserCreate(BaseModel):
    nim: str
    name: str
    role: RoleEnum
    kode_akses: str

class UserResponse(BaseModel):
    id: int
    nim: str
    name: str
    role: RoleEnum

    class Config:
        orm_mode = True
