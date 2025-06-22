from pydantic import BaseModel, validator

class AbsenCreate(BaseModel):
    nama_matakuliah: str
    kelas: str  # A, B, C, dll
    semester: int
    dosen: str
    jurusan: str

class AbsenUpdate(BaseModel):
    nama_matakuliah: str = None  # Ganti Optional[str] dengan ini
    satuan: str = None
    semester: int = None
    dosen: str = None
    jurusan: str = None

class AbsenResponse(BaseModel):
    id: int
    nama_matakuliah: str
    kelas: str
    semester: int
    dosen: str
    jurusan: str
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

    @validator("created_at", "updated_at", pre=True)
    def serialize_datetime(cls, v):
        if hasattr(v, "isoformat"):
            return v.isoformat()
        return str(v)