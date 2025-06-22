from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Absen, User, RoleEnum
from app.auth import get_current_user
from app.schemas.absen import AbsenCreate, AbsenResponse, AbsenUpdate

router = APIRouter(prefix="/absen", tags=["Absen"])

def require_staff(current_user: User = Depends(get_current_user)):
    """Middleware untuk memastikan user adalah staff"""
    if current_user.role != RoleEnum.staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak: Hanya staff yang dapat mengakses endpoint ini"
        )
    return current_user

@router.post("/", response_model=AbsenResponse, status_code=status.HTTP_201_CREATED)
def create_absen(
    absen_data: AbsenCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Create data absen baru (Staff only)"""
    db_absen = Absen(**absen_data.dict())
    db.add(db_absen)
    db.commit()
    db.refresh(db_absen)
    return db_absen

@router.get("/", response_model=List[AbsenResponse])
def get_all_absen(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    semester: int = Query(None, description="Filter by semester"),  # Hapus Optional
    jurusan: str = Query(None, description="Filter by jurusan"),    # Hapus Optional
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get semua data absen dengan pagination dan filter"""
    skip = (page - 1) * per_page
    query = db.query(Absen)
    
    # Apply filters - FastAPI otomatis handle None
    if semester:
        query = query.filter(Absen.semester == semester)
    if jurusan:
        query = query.filter(Absen.jurusan.ilike(f"%{jurusan}%"))
    
    absen_list = query.offset(skip).limit(per_page).all()
    return absen_list

@router.get("/{absen_id}", response_model=AbsenResponse)
def get_absen_by_id(
    absen_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detail absen by ID"""
    absen = db.query(Absen).filter(Absen.id == absen_id).first()
    if not absen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data absen tidak ditemukan"
        )
    return absen

@router.get("/search/matakuliah", response_model=List[AbsenResponse])
def search_absen_by_matakuliah(
    nama_matakuliah: str = Query(..., description="Nama mata kuliah yang dicari"),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search absen by nama mata kuliah"""
    skip = (page - 1) * per_page
    absen_list = db.query(Absen).filter(
        Absen.nama_matakuliah.ilike(f"%{nama_matakuliah}%")
    ).offset(skip).limit(per_page).all()
    return absen_list

@router.get("/dosen/{dosen_name}", response_model=List[AbsenResponse])
def get_absen_by_dosen(
    dosen_name: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get absen by nama dosen"""
    skip = (page - 1) * per_page
    absen_list = db.query(Absen).filter(
        Absen.dosen.ilike(f"%{dosen_name}%")
    ).offset(skip).limit(per_page).all()
    return absen_list

@router.put("/{absen_id}", response_model=AbsenResponse)
def update_absen(
    absen_id: int,
    absen_data: AbsenUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Update data absen (Staff only)"""
    db_absen = db.query(Absen).filter(Absen.id == absen_id).first()
    if not db_absen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data absen tidak ditemukan"
        )
    
    for field, value in absen_data.dict(exclude_unset=True).items():
        setattr(db_absen, field, value)
    
    db.commit()
    db.refresh(db_absen)
    return db_absen

@router.delete("/{absen_id}")
def delete_absen(
    absen_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Delete data absen (Staff only)"""
    db_absen = db.query(Absen).filter(Absen.id == absen_id).first()
    if not db_absen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Data absen tidak ditemukan"
        )
    
    db.delete(db_absen)
    db.commit()
    return {"message": "Data absen berhasil dihapus"}