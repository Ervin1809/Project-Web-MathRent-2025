from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from app.models import StatusBarangEnum

class BarangBase(BaseModel):
    nama: str
    satuan: str
    stok: int
    lokasi: str
    
    @validator('nama')
    def validate_nama(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Nama barang minimal 2 karakter')
        return v.strip().title()
    
    @validator('satuan')
    def validate_satuan(cls, v):
        if len(v.strip()) < 1:
            raise ValueError('Satuan tidak boleh kosong')
        return v.strip().lower()
    
    @validator('stok')
    def validate_stok(cls, v):
        if v < 0:
            raise ValueError('Stok tidak boleh negatif')
        return v
    
    @validator('lokasi')
    def validate_lokasi(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Lokasi minimal 2 karakter')
        return v.strip().title()

class BarangCreate(BarangBase):
    """Schema untuk create barang baru"""
    pass

class BarangUpdate(BaseModel):
    """Schema untuk update barang (semua field optional)"""
    nama: Optional[str] = None
    satuan: Optional[str] = None
    stok: Optional[int] = None
    status: Optional[StatusBarangEnum] = None
    lokasi: Optional[str] = None
    
    @validator('nama')
    def validate_nama(cls, v):
        if v is not None and len(v.strip()) < 2:
            raise ValueError('Nama barang minimal 2 karakter')
        return v.strip().title() if v else None
    
    @validator('satuan')
    def validate_satuan(cls, v):
        if v is not None and len(v.strip()) < 1:
            raise ValueError('Satuan tidak boleh kosong')
        return v.strip().lower() if v else None
    
    @validator('stok')
    def validate_stok(cls, v):
        if v is not None and v < 0:
            raise ValueError('Stok tidak boleh negatif')
        return v
    
    @validator('lokasi')
    def validate_lokasi(cls, v):
        if v is not None and len(v.strip()) < 2:
            raise ValueError('Lokasi minimal 2 karakter')
        return v.strip().title() if v else None

class BarangResponse(BarangBase):
    """Schema untuk response barang"""
    id: int
    status: StatusBarangEnum
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class BarangListResponse(BaseModel):
    """Schema untuk list barang dengan pagination"""
    items: list[BarangResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

class StokUpdateRequest(BaseModel):
    """Schema khusus untuk update stok"""
    stok: int
    
    @validator('stok')
    def validate_stok(cls, v):
        if v < 0:
            raise ValueError('Stok tidak boleh negatif')
        return v

class StatusUpdateRequest(BaseModel):
    """Schema khusus untuk update status"""
    status: StatusBarangEnum