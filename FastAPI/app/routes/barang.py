from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
import math
from app.database import get_db
from app.models import User, StatusBarangEnum
from app.schemas.barang import (
    BarangCreate, BarangUpdate, BarangResponse, BarangListResponse,
    StokUpdateRequest, StatusUpdateRequest
)
from app.crud import barang as crud_barang
from app.auth import get_current_user, require_staff

router = APIRouter(prefix="/barang", tags=["Barang"])

@router.get("/", response_model=BarangListResponse)
def get_barang_list(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by nama, lokasi, or satuan"),
    status: Optional[StatusBarangEnum] = Query(None, description="Filter by status"),
    lokasi: Optional[str] = Query(None, description="Filter by lokasi"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of barang with pagination and filters"""
    skip = (page - 1) * per_page
    items, total = crud_barang.get_barang_list(
        db=db, 
        skip=skip, 
        limit=per_page,
        search=search,
        status=status,
        lokasi=lokasi
    )
    
    total_pages = math.ceil(total / per_page)
    
    return BarangListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@router.get("/tersedia", response_model=BarangListResponse)
def get_barang_tersedia(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get only available barang (for mahasiswa to see what they can borrow)"""
    skip = (page - 1) * per_page
    items, total = crud_barang.get_barang_tersedia(db=db, skip=skip, limit=per_page)
    
    total_pages = math.ceil(total / per_page)
    
    return BarangListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages
    )

@router.get("/{barang_id}", response_model=BarangResponse)
def get_barang_detail(
    barang_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get barang detail by ID"""
    barang = crud_barang.get_barang(db=db, barang_id=barang_id)
    if not barang:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barang tidak ditemukan"
        )
    return barang

@router.post("/", response_model=BarangResponse, status_code=status.HTTP_201_CREATED)
def create_barang(
    barang_data: BarangCreate,
    current_user: User = Depends(require_staff),  # Only staff can create
    db: Session = Depends(get_db)
):
    """Create new barang (Staff only)"""
    
    # Check if barang with same name already exists
    existing = crud_barang.get_barang_by_nama(db=db, nama=barang_data.nama)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Barang dengan nama '{barang_data.nama}' sudah ada"
        )
    
    return crud_barang.create_barang(db=db, barang=barang_data)

@router.put("/{barang_id}", response_model=BarangResponse)
def update_barang(
    barang_id: int,
    barang_update: BarangUpdate,
    current_user: User = Depends(require_staff),  # Only staff can update
    db: Session = Depends(get_db)
):
    """Update barang (Staff only)"""
    
    # Check if nama is being updated to existing name
    if barang_update.nama:
        existing = crud_barang.get_barang_by_nama(db=db, nama=barang_update.nama)
        if existing and existing.id != barang_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Barang dengan nama '{barang_update.nama}' sudah ada"
            )
    
    updated_barang = crud_barang.update_barang(db=db, barang_id=barang_id, barang_update=barang_update)
    if not updated_barang:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barang tidak ditemukan"
        )
    
    return updated_barang

@router.patch("/{barang_id}/stok", response_model=BarangResponse)
def update_stok_barang(
    barang_id: int,
    stok_update: StokUpdateRequest,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db)
):
    """Update stok barang (Staff only)"""
    updated_barang = crud_barang.update_stok_barang(
        db=db, 
        barang_id=barang_id, 
        new_stok=stok_update.stok
    )
    if not updated_barang:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barang tidak ditemukan"
        )
    
    return updated_barang

@router.patch("/{barang_id}/status", response_model=BarangResponse)
def update_status_barang(
    barang_id: int,
    status_update: StatusUpdateRequest,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db)
):
    """Update status barang (Staff only)"""
    updated_barang = crud_barang.update_status_barang(
        db=db, 
        barang_id=barang_id, 
        new_status=status_update.status
    )
    if not updated_barang:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barang tidak ditemukan"
        )
    
    return updated_barang

@router.delete("/{barang_id}")
def delete_barang(
    barang_id: int,
    current_user: User = Depends(require_staff),
    db: Session = Depends(get_db)
):
    """Delete barang (Staff only)"""
    success = crud_barang.delete_barang(db=db, barang_id=barang_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Barang tidak ditemukan"
        )
    
    return {"message": "Barang berhasil dihapus"}

@router.get("/{barang_id}/availability")
def check_barang_availability(
    barang_id: int,
    jumlah: int = Query(1, ge=1, description="Jumlah yang ingin dipinjam"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if barang available for borrowing"""
    result = crud_barang.check_barang_availability(
        db=db, 
        barang_id=barang_id, 
        jumlah_needed=jumlah
    )
    return result