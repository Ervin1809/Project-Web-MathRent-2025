from pydantic import BaseModel, validator
from app.models import StatusBarangEnum  # Import existing enum

class AbsenCreate(BaseModel):
    nama_matakuliah: str
    kelas: str
    semester: int
    dosen: str
    jurusan: str

class AbsenUpdate(BaseModel):
    nama_matakuliah: str = None
    kelas: str = None
    semester: int = None
    dosen: str = None
    jurusan: str = None
    status: StatusBarangEnum = None  # ADD: Allow status update

class AbsenResponse(BaseModel):
    id: int
    nama_matakuliah: str
    kelas: str
    semester: int
    dosen: str
    jurusan: str
    status: StatusBarangEnum  # ADD: Include status field ✅
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

    @validator("created_at", "updated_at", pre=True)
    def serialize_datetime(cls, v):
        if hasattr(v, "isoformat"):
            return v.isoformat()
        return str(v)

    @validator("status", pre=True)
    def serialize_status(cls, v):
        print("DEBUG STATUS:", v)
        if hasattr(v, "value"):
            return v.value
        return str(v)