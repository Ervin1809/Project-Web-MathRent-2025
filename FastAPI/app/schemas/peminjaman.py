from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import date, datetime
from app.models import StatusPeminjamanEnum, ReferenceTypeEnum

# === DETAIL ITEM SCHEMAS ===
class PeminjamanDetailCreate(BaseModel):
    reference_type: ReferenceTypeEnum
    reference_id: int
    jumlah: Optional[int] = None  # Untuk barang saja
    waktu_mulai: Optional[datetime] = None  # Untuk kelas saja
    waktu_selesai: Optional[datetime] = None  # Untuk kelas saja

class PeminjamanDetailResponse(BaseModel):
    id: int
    reference_type: ReferenceTypeEnum
    reference_id: int
    jumlah: Optional[int] = None
    waktu_mulai: Optional[str] = None
    waktu_selesai: Optional[str] = None
    created_at: str
    
    class Config:
        from_attributes = True
    
    @validator("waktu_mulai", "waktu_selesai", "created_at", pre=True)
    def serialize_datetime(cls, v):
        if v and hasattr(v, "isoformat"):
            return v.isoformat()
        return str(v) if v else None

# === PEMINJAMAN SCHEMAS ===
class PeminjamanCreate(BaseModel):
    tanggal_peminjaman: date
    notes: Optional[str] = None
    details: List[PeminjamanDetailCreate]

class PeminjamanUpdate(BaseModel):
    tanggal_peminjaman: Optional[date] = None
    notes: Optional[str] = None
    status: Optional[StatusPeminjamanEnum] = None

class PeminjamanApprovalRequest(BaseModel):
    status: StatusPeminjamanEnum  # disetujui atau dikembalikan
    notes: Optional[str] = None

class PeminjamanResponse(BaseModel):
    id: int
    user_id: int
    tanggal_peminjaman: str
    status: StatusPeminjamanEnum
    approved_by: Optional[int] = None
    verification_code: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str
    
    # User info
    user_name: Optional[str] = None
    user_nim: Optional[str] = None
    approver_name: Optional[str] = None
    
    # Details
    details: List[PeminjamanDetailResponse] = []
    
    class Config:
        from_attributes = True
    
    @validator("tanggal_peminjaman", "created_at", "updated_at", pre=True)
    def serialize_datetime(cls, v):
        if v and hasattr(v, "isoformat"):
            return v.isoformat()
        return str(v) if v else None

class PeminjamanWithItemsResponse(BaseModel):
    id: int
    user_id: int
    tanggal_peminjaman: str
    status: StatusPeminjamanEnum
    approved_by: Optional[int] = None
    verification_code: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str
    
    # User info
    user_name: Optional[str] = None
    user_nim: Optional[str] = None
    approver_name: Optional[str] = None
    
    # Expanded items dengan detail lengkap
    items: List[dict] = []  # Will contain expanded item details
    
    class Config:
        from_attributes = True
    
    @validator("tanggal_peminjaman", "created_at", "updated_at", pre=True)
    def serialize_datetime(cls, v):
        if v and hasattr(v, "isoformat"):
            return v.isoformat()
        return str(v) if v else None