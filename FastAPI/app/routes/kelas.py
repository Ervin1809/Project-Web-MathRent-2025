from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Kelas
from app.schemas.kelas import KelasCreate, KelasUpdate, KelasResponse  # ADD: Import schemas

router = APIRouter(prefix="/kelas", tags=["kelas"])

@router.get("/")
def get_all_kelas(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    offset = (page - 1) * per_page
    
    kelas_list = db.query(Kelas).offset(offset).limit(per_page).all()
    total = db.query(Kelas).count()
    
    # Transform response - REMOVED status completely
    kelas_data = []
    for kelas in kelas_list:
        kelas_data.append({
            "id": kelas.id,
            "nama_kelas": kelas.nama_kelas,
            "gedung": kelas.gedung,
            "lantai": kelas.lantai,
            "kapasitas": kelas.kapasitas,
            "fasilitas": kelas.fasilitas,
            "created_at": kelas.created_at,
            "updated_at": kelas.updated_at
        })
    
    return {
        "data": kelas_data,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
    }

@router.get("/{kelas_id}", response_model=KelasResponse)
def get_kelas(kelas_id: int, db: Session = Depends(get_db)):
    kelas = db.query(Kelas).filter(Kelas.id == kelas_id).first()
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas not found")
    
    return kelas  # Let Pydantic handle the response transformation

# FIXED: Use Pydantic schema instead of individual parameters
@router.post("/", response_model=KelasResponse)
def create_kelas(
    kelas_data: KelasCreate,  # ✅ Use Pydantic schema
    db: Session = Depends(get_db)
):
    # Create new kelas using schema data
    new_kelas = Kelas(
        nama_kelas=kelas_data.nama_kelas,
        gedung=kelas_data.gedung,
        lantai=kelas_data.lantai,
        kapasitas=kelas_data.kapasitas,
        fasilitas=kelas_data.fasilitas
    )
    
    db.add(new_kelas)
    db.commit()
    db.refresh(new_kelas)
    
    return new_kelas  # Return the ORM object, Pydantic will serialize it

# FIXED: Use Pydantic schema instead of individual parameters  
@router.put("/{kelas_id}", response_model=KelasResponse)
def update_kelas(
    kelas_id: int,
    kelas_data: KelasUpdate,  # ✅ Use Pydantic schema
    db: Session = Depends(get_db)
):
    kelas = db.query(Kelas).filter(Kelas.id == kelas_id).first()
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas not found")
    
    # Update fields using schema data
    for field, value in kelas_data.dict(exclude_unset=True).items():
        setattr(kelas, field, value)
    
    db.commit()
    db.refresh(kelas)
    
    return kelas  # Return the ORM object, Pydantic will serialize it

@router.delete("/{kelas_id}")
def delete_kelas(kelas_id: int, db: Session = Depends(get_db)):
    kelas = db.query(Kelas).filter(Kelas.id == kelas_id).first()
    if not kelas:
        raise HTTPException(status_code=404, detail="Kelas not found")
    
    db.delete(kelas)
    db.commit()
    
    return {"message": "Kelas deleted successfully"}