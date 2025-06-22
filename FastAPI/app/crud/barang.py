from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from app.models import Barang, StatusBarangEnum
from app.schemas.barang import BarangCreate, BarangUpdate
from datetime import datetime

def get_barang(db: Session, barang_id: int) -> Optional[Barang]:
    """Get barang by ID"""
    return db.query(Barang).filter(Barang.id == barang_id).first()

def get_barang_by_nama(db: Session, nama: str) -> Optional[Barang]:
    """Get barang by nama (case insensitive)"""
    return db.query(Barang).filter(Barang.nama.ilike(f"%{nama}%")).first()

def get_barang_list(
    db: Session, 
    skip: int = 0, 
    limit: int = 20,
    search: Optional[str] = None,
    status: Optional[StatusBarangEnum] = None,
    lokasi: Optional[str] = None
) -> tuple[List[Barang], int]:
    """Get list of barang with filters and pagination"""
    query = db.query(Barang)
    
    # Apply filters
    if search:
        query = query.filter(
            or_(
                Barang.nama.ilike(f"%{search}%"),
                Barang.lokasi.ilike(f"%{search}%"),
                Barang.satuan.ilike(f"%{search}%")
            )
        )
    
    if status:
        query = query.filter(Barang.status == status)
    
    if lokasi:
        query = query.filter(Barang.lokasi.ilike(f"%{lokasi}%"))
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    items = query.order_by(Barang.nama).offset(skip).limit(limit).all()
    
    return items, total

def get_barang_tersedia(db: Session, skip: int = 0, limit: int = 20) -> tuple[List[Barang], int]:
    """Get only available barang"""
    return get_barang_list(
        db=db, 
        skip=skip, 
        limit=limit, 
        status=StatusBarangEnum.tersedia
    )

def create_barang(db: Session, barang: BarangCreate) -> Barang:
    """Create new barang"""
    db_barang = Barang(
        nama=barang.nama,
        satuan=barang.satuan,
        stok=barang.stok,
        lokasi=barang.lokasi,
        status=StatusBarangEnum.tersedia  # Default status
    )
    db.add(db_barang)
    db.commit()
    db.refresh(db_barang)
    return db_barang

def update_barang(db: Session, barang_id: int, barang_update: BarangUpdate) -> Optional[Barang]:
    """Update barang"""
    db_barang = get_barang(db, barang_id)
    if not db_barang:
        return None
    
    # Update only provided fields
    update_data = barang_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_barang, field, value)
    
    db_barang.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_barang)
    return db_barang

def update_stok_barang(db: Session, barang_id: int, new_stok: int) -> Optional[Barang]:
    """Update stok barang"""
    db_barang = get_barang(db, barang_id)
    if not db_barang:
        return None
    
    db_barang.stok = new_stok
    db_barang.updated_at = datetime.utcnow()
    
    # Auto update status based on stok
    if new_stok == 0:
        db_barang.status = StatusBarangEnum.dipinjam
    elif db_barang.status == StatusBarangEnum.dipinjam and new_stok > 0:
        db_barang.status = StatusBarangEnum.tersedia
    
    db.commit()
    db.refresh(db_barang)
    return db_barang

def update_status_barang(db: Session, barang_id: int, new_status: StatusBarangEnum) -> Optional[Barang]:
    """Update status barang"""
    db_barang = get_barang(db, barang_id)
    if not db_barang:
        return None
    
    db_barang.status = new_status
    db_barang.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_barang)
    return db_barang

def delete_barang(db: Session, barang_id: int) -> bool:
    """Delete barang (soft delete by changing status)"""
    db_barang = get_barang(db, barang_id)
    if not db_barang:
        return False
    
    # For now, we'll do hard delete. In production, consider soft delete
    db.delete(db_barang)
    db.commit()
    return True

def check_barang_availability(db: Session, barang_id: int, jumlah_needed: int) -> dict:
    """Check if barang available for borrowing"""
    barang = get_barang(db, barang_id)
    if not barang:
        return {'available': False, 'reason': 'Barang tidak ditemukan'}
    
    if barang.status != StatusBarangEnum.tersedia:
        return {'available': False, 'reason': f'Barang sedang {barang.status.value}'}
    
    if barang.stok < jumlah_needed:
        return {
            'available': False, 
            'reason': f'Stok tidak cukup. Tersedia: {barang.stok}, dibutuhkan: {jumlah_needed}'
        }
    
    return {'available': True, 'reason': 'Barang tersedia'}