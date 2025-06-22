from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Kelas, User, RoleEnum, StatusBarangEnum  # Gunakan StatusBarangEnum
from app.auth import get_current_user
from app.schemas.kelas import KelasCreate, KelasResponse, KelasUpdate, StatusKelasUpdate

router = APIRouter(prefix="/kelas", tags=["Kelas"])

def require_staff(current_user: User = Depends(get_current_user)):
    """Middleware untuk memastikan user adalah staff"""
    if current_user.role != RoleEnum.staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak: Hanya staff yang dapat mengakses endpoint ini"
        )
    return current_user

@router.post("/", response_model=KelasResponse, status_code=status.HTTP_201_CREATED)
def create_kelas(
    kelas_data: KelasCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Create kelas baru (Staff only)"""
    db_kelas = Kelas(**kelas_data.dict())
    db.add(db_kelas)
    db.commit()
    db.refresh(db_kelas)
    return db_kelas

@router.get("/", response_model=List[KelasResponse])
def get_all_kelas(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get semua kelas dengan pagination"""
    skip = (page - 1) * per_page
    kelas_list = db.query(Kelas).offset(skip).limit(per_page).all()
    return kelas_list

@router.get("/tersedia", response_model=List[KelasResponse])
def get_kelas_tersedia(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get kelas yang tersedia"""
    skip = (page - 1) * per_page
    kelas_list = db.query(Kelas).filter(
        Kelas.status == StatusBarangEnum.tersedia  # Gunakan StatusBarangEnum
    ).offset(skip).limit(per_page).all()
    return kelas_list

@router.get("/{kelas_id}", response_model=KelasResponse)
def get_kelas_by_id(
    kelas_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detail kelas by ID"""
    kelas = db.query(Kelas).filter(Kelas.id == kelas_id).first()
    if not kelas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kelas tidak ditemukan"
        )
    return kelas

@router.put("/{kelas_id}", response_model=KelasResponse)
def update_kelas(
    kelas_id: int,
    kelas_data: KelasUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Update kelas (Staff only)"""
    db_kelas = db.query(Kelas).filter(Kelas.id == kelas_id).first()
    if not db_kelas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kelas tidak ditemukan"
        )
    
    for field, value in kelas_data.dict(exclude_unset=True).items():
        setattr(db_kelas, field, value)
    
    db.commit()
    db.refresh(db_kelas)
    return db_kelas

@router.patch("/{kelas_id}/status", response_model=KelasResponse)
def update_status_kelas(
    kelas_id: int,
    status_data: StatusKelasUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Update status kelas (Staff only)"""
    db_kelas = db.query(Kelas).filter(Kelas.id == kelas_id).first()
    if not db_kelas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kelas tidak ditemukan"
        )
    
    db_kelas.status = status_data.status
    db.commit()
    db.refresh(db_kelas)
    return db_kelas

@router.delete("/{kelas_id}")
def delete_kelas(
    kelas_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Delete kelas (Staff only)"""
    db_kelas = db.query(Kelas).filter(Kelas.id == kelas_id).first()
    if not db_kelas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kelas tidak ditemukan"
        )
    
    db.delete(db_kelas)
    db.commit()
    return {"message": "Kelas berhasil dihapus"}