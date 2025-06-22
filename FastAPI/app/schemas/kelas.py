from pydantic import BaseModel, validator
from typing import Optional
from app.models import StatusBarangEnum  # Gunakan StatusBarangEnum

class KelasCreate(BaseModel):
    nama_kelas: str
    gedung: str
    lantai: int
    kapasitas: int
    fasilitas: Optional[str] = None

class KelasUpdate(BaseModel):
    nama_kelas: Optional[str] = None
    gedung: Optional[str] = None
    lantai: Optional[int] = None
    kapasitas: Optional[int] = None
    fasilitas: Optional[str] = None
    status: Optional[StatusBarangEnum] = None  # Gunakan StatusBarangEnum

class StatusKelasUpdate(BaseModel):
    status: StatusBarangEnum  # Gunakan StatusBarangEnum

class KelasResponse(BaseModel):
    id: int
    nama_kelas: str
    gedung: str
    lantai: int
    kapasitas: int
    fasilitas: Optional[str]
    status: StatusBarangEnum  # Gunakan StatusBarangEnum
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

    @validator("created_at", "updated_at", pre=True)
    def serialize_datetime(cls, v):
        if hasattr(v, "isoformat"):
            return v.isoformat()
        return str(v)