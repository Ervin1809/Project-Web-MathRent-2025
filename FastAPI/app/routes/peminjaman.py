from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime
import secrets
import string
from app.database import get_db
from app.models import (
    Peminjaman, PeminjamanDetail, User, Barang, Kelas, Absen,
    RoleEnum, StatusPeminjamanEnum, ReferenceTypeEnum, StatusBarangEnum
)
from app.auth import get_current_user
from app.schemas.peminjaman import (
    PeminjamanCreate, PeminjamanResponse, PeminjamanUpdate,
    PeminjamanApprovalRequest, PeminjamanWithItemsResponse,
    PeminjamanDetailCreate, 
)

router = APIRouter(prefix="/peminjaman", tags=["Peminjaman"])

# Tambahkan ke bagian atas file (setelah imports yang sudah ada)

def require_mahasiswa(current_user: User = Depends(get_current_user)):
    """Middleware untuk memastikan user adalah mahasiswa"""
    if current_user.role != RoleEnum.mahasiswa:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak: Hanya mahasiswa yang dapat mengakses endpoint ini"
        )
    return current_user

def validate_peminjaman_items(details: List[PeminjamanDetailCreate], db: Session):
    """Validasi items yang akan dipinjam"""
    errors = []
    
    for i, detail in enumerate(details):
        # Validasi berdasarkan reference_type
        if detail.reference_type == ReferenceTypeEnum.barang:
            if not detail.jumlah or detail.jumlah <= 0:
                errors.append(f"Item {i+1}: Jumlah barang harus diisi dan > 0")
            if detail.waktu_mulai or detail.waktu_selesai:
                errors.append(f"Item {i+1}: Barang tidak perlu waktu mulai/selesai")
                
            # Cek ketersediaan barang
            barang = db.query(Barang).filter(Barang.id == detail.reference_id).first()
            if not barang:
                errors.append(f"Item {i+1}: Barang dengan ID {detail.reference_id} tidak ditemukan")
            elif barang.status != StatusBarangEnum.tersedia:
                errors.append(f"Item {i+1}: Barang '{barang.nama}' tidak tersedia")
            elif barang.stok < detail.jumlah:
                errors.append(f"Item {i+1}: Stok barang '{barang.nama}' tidak mencukupi (tersedia: {barang.stok})")
                
        elif detail.reference_type == ReferenceTypeEnum.kelas:
            if not detail.waktu_mulai or not detail.waktu_selesai:
                errors.append(f"Item {i+1}: Waktu mulai dan selesai harus diisi untuk kelas")
            if detail.jumlah:
                errors.append(f"Item {i+1}: Kelas tidak perlu jumlah")
            if detail.waktu_mulai and detail.waktu_selesai and detail.waktu_mulai >= detail.waktu_selesai:
                errors.append(f"Item {i+1}: Waktu mulai harus lebih awal dari waktu selesai")
                
        elif detail.reference_type == ReferenceTypeEnum.absen:
            if detail.jumlah or detail.waktu_mulai or detail.waktu_selesai:
                errors.append(f"Item {i+1}: Absen tidak perlu jumlah atau waktu")
                
            # Cek ketersediaan absen
            absen = db.query(Absen).filter(Absen.id == detail.reference_id).first()
            if not absen:
                errors.append(f"Item {i+1}: Data absen dengan ID {detail.reference_id} tidak ditemukan")
    
    return errors

# === ENDPOINTS UNTUK MAHASISWA ===

@router.post("/", response_model=PeminjamanResponse, status_code=status.HTTP_201_CREATED)
def create_peminjaman_mahasiswa(
    peminjaman_data: PeminjamanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_mahasiswa)
):
    """Create peminjaman baru (Mahasiswa only)"""
    
    # Validasi items
    validation_errors = validate_peminjaman_items(peminjaman_data.details, db)
    if validation_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Validasi gagal",
                "errors": validation_errors
            }
        )
    
    # Create peminjaman
    db_peminjaman = Peminjaman(
        user_id=current_user.id,
        tanggal_peminjaman=peminjaman_data.tanggal_peminjaman,
        status=StatusPeminjamanEnum.pending,
        notes=peminjaman_data.notes
    )
    db.add(db_peminjaman)
    db.flush()  # Untuk mendapatkan ID
    
    # Create peminjaman details
    for detail_data in peminjaman_data.details:
        db_detail = PeminjamanDetail(
            peminjaman_id=db_peminjaman.id,
            reference_type=detail_data.reference_type,
            reference_id=detail_data.reference_id,
            jumlah=detail_data.jumlah,
            waktu_mulai=detail_data.waktu_mulai,
            waktu_selesai=detail_data.waktu_selesai
        )
        db.add(db_detail)
    
    db.commit()
    db.refresh(db_peminjaman)
    
    # Build response
    data = PeminjamanResponse.from_orm(db_peminjaman)
    data.user_name = current_user.name
    data.user_nim = current_user.nim
    data.details = [detail for detail in db_peminjaman.details]
    
    return data

@router.get("/my", response_model=List[PeminjamanResponse])
def get_my_peminjaman(
    page: int = Query(1, ge=1),
    per_page: int = Query(100, ge=1, le=100),
    status: StatusPeminjamanEnum = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_mahasiswa)
):
    """Get peminjaman milik mahasiswa yang sedang login"""
    skip = (page - 1) * per_page
    query = db.query(Peminjaman).filter(Peminjaman.user_id == current_user.id)
    
    if status:
        query = query.filter(Peminjaman.status == status)
    
    peminjaman_list = query.order_by(Peminjaman.created_at.desc()).offset(skip).limit(per_page).all()
    
    result = []
    for p in peminjaman_list:
        data = PeminjamanResponse.from_orm(p)
        data.user_name = current_user.name
        data.user_nim = current_user.nim
        if p.approver:
            data.approver_name = p.approver.name
        data.details = [detail for detail in p.details]
        result.append(data)
    
    return result

@router.put("/my/{peminjaman_id}", response_model=PeminjamanResponse)
def update_my_peminjaman(
    peminjaman_id: int,
    peminjaman_data: PeminjamanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_mahasiswa)
):
    """Update peminjaman milik mahasiswa (hanya yang pending)"""
    peminjaman = db.query(Peminjaman).filter(
        Peminjaman.id == peminjaman_id,
        Peminjaman.user_id == current_user.id
    ).first()
    
    if not peminjaman:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Peminjaman tidak ditemukan atau bukan milik Anda"
        )
    
    if peminjaman.status != StatusPeminjamanEnum.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hanya peminjaman dengan status pending yang bisa diupdate"
        )
    
    # Update fields
    for field, value in peminjaman_data.dict(exclude_unset=True).items():
        if field != "status":  # Mahasiswa tidak bisa ubah status
            setattr(peminjaman, field, value)
    
    db.commit()
    db.refresh(peminjaman)
    
    # Build response
    data = PeminjamanResponse.from_orm(peminjaman)
    data.user_name = current_user.name
    data.user_nim = current_user.nim
    data.details = [detail for detail in peminjaman.details]
    
    return data

@router.delete("/my/{peminjaman_id}")
def delete_my_peminjaman(
    peminjaman_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_mahasiswa)
):
    """Delete peminjaman milik mahasiswa (hanya yang pending)"""
    peminjaman = db.query(Peminjaman).filter(
        Peminjaman.id == peminjaman_id,
        Peminjaman.user_id == current_user.id
    ).first()
    
    if not peminjaman:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Peminjaman tidak ditemukan atau bukan milik Anda"
        )
    
    if peminjaman.status != StatusPeminjamanEnum.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hanya peminjaman dengan status pending yang bisa dihapus"
        )
    
    db.delete(peminjaman)
    db.commit()
    return {"message": "Peminjaman berhasil dihapus"}

# === ENDPOINTS UNTUK MELIHAT ITEM YANG TERSEDIA ===

# Tambahkan di bagian akhir file, sebelum endpoint terakhir

@router.get("/kelas/schedule")
def get_kelas_schedule(
    kelas_id: int = Query(..., description="ID kelas yang ingin dicek"),
    tanggal: date = Query(..., description="Tanggal yang ingin dicek (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get jadwal booking kelas untuk tanggal tertentu"""
    
    # Query peminjaman yang aktif (disetujui) untuk kelas dan tanggal tertentu
    peminjaman_list = db.query(Peminjaman).filter(
        Peminjaman.tanggal_peminjaman == tanggal,
        Peminjaman.status == StatusPeminjamanEnum.disetujui
    ).all()
    
    # Filter yang punya detail kelas sesuai kelas_id
    jadwal_booking = []
    
    for peminjaman in peminjaman_list:
        for detail in peminjaman.details:
            if (detail.reference_type == ReferenceTypeEnum.kelas and 
                detail.reference_id == kelas_id and
                detail.waktu_mulai and detail.waktu_selesai):
                
                jadwal_booking.append({
                    "peminjaman_id": peminjaman.id,
                    "user_name": peminjaman.user.name if peminjaman.user else "Unknown",
                    "user_nim": peminjaman.user.nim if peminjaman.user else "Unknown",
                    "waktu_mulai": detail.waktu_mulai.strftime("%H:%M"),
                    "waktu_selesai": detail.waktu_selesai.strftime("%H:%M"),
                    "status": peminjaman.status.value,
                    "tanggal_peminjaman": peminjaman.tanggal_peminjaman.isoformat()
                })
    
    # Sort by waktu_mulai
    jadwal_booking.sort(key=lambda x: x["waktu_mulai"])
    
    return {
        "kelas_id": kelas_id,
        "tanggal": tanggal.isoformat(),
        "total_booking": len(jadwal_booking),
        "jadwal": jadwal_booking
    }

@router.get("/available-items", response_model=dict)
def get_available_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get semua item yang tersedia untuk dipinjam"""
    
    # Barang tersedia
    barang_list = db.query(Barang).filter(
        Barang.status == StatusBarangEnum.tersedia,
        Barang.stok > 0
    ).all()
    
    # Kelas tersedia
    kelas_list = db.query(Kelas).filter(
        Kelas.status == StatusBarangEnum.tersedia
    ).all()
    
    # Absen (semua tersedia)
    absen_list = db.query(Absen).all()
    
    return {
        "barang": [
            {
                "id": b.id,
                "nama": b.nama,
                "satuan": b.satuan,
                "stok": b.stok,
                "lokasi": b.lokasi
            } for b in barang_list
        ],
        "kelas": [
            {
                "id": k.id,
                "nama_kelas": k.nama_kelas,
                "gedung": k.gedung,
                "lantai": k.lantai,
                "kapasitas": k.kapasitas,
                "fasilitas": k.fasilitas
            } for k in kelas_list
        ],
        "absen": [
            {
                "id": a.id,
                "nama_matakuliah": a.nama_matakuliah,
                "kelas": a.kelas,
                "semester": a.semester,
                "dosen": a.dosen,
                "jurusan": a.jurusan
            } for a in absen_list
        ]
    }

def require_staff(current_user: User = Depends(get_current_user)):
    """Middleware untuk memastikan user adalah staff"""
    if current_user.role != RoleEnum.staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak: Hanya staff yang dapat mengakses endpoint ini"
        )
    return current_user

def generate_verification_code():
    """Generate random verification code untuk peminjaman"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))

def expand_peminjaman_items(peminjaman: Peminjaman, db: Session):
    """Expand peminjaman details dengan info item lengkap"""
    items = []
    for detail in peminjaman.details:
        item_info = detail.get_referenced_item_with_type(db)
        if item_info:
            items.append({
                "detail_id": detail.id,
                "type": item_info['type'],
                "item": {
                    "id": item_info['item'].id,
                    "name": getattr(item_info['item'], 'nama', None) or 
                           getattr(item_info['item'], 'nama_kelas', None) or
                           getattr(item_info['item'], 'nama_matakuliah', None),
                    "details": item_info['item'].__dict__ if hasattr(item_info['item'], '__dict__') else {}
                },
                "peminjaman_details": item_info['details']
            })
    return items


# Tambahkan import yang diperlukan di atas
from datetime import date, datetime, timedelta

# Tambahkan setelah endpoint yang sudah ada, sebelum bagian terakhir

# =====================================================================
# ================= ENDPOINTS KHUSUS UNTUK STAFF DASHBOARD ===========
# =====================================================================

@router.get("/staff/today", response_model=List[PeminjamanResponse])
def get_today_peminjaman_staff(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Get peminjaman hari ini untuk staff dashboard"""
    today = date.today()
    
    peminjaman_list = db.query(Peminjaman).filter(
        Peminjaman.tanggal_peminjaman == today
    ).order_by(Peminjaman.created_at.desc()).all()
    
    # Build response dengan data lengkap
    result = []
    for p in peminjaman_list:
        data = PeminjamanResponse.from_orm(p)
        if p.user:
            data.user_name = p.user.name
            data.user_nim = p.user.nim
        if p.approver:
            data.approver_name = p.approver.name
        
        # Expand details dengan item info
        expanded_details = []
        for detail in p.details:
            detail_dict = {
                "id": detail.id,
                "reference_type": detail.reference_type,
                "reference_id": detail.reference_id,
                "jumlah": detail.jumlah,
                "waktu_mulai": detail.waktu_mulai,
                "waktu_selesai": detail.waktu_selesai,
            }
            
            # Add referenced item data
            if detail.reference_type == ReferenceTypeEnum.barang:
                barang = db.query(Barang).filter(Barang.id == detail.reference_id).first()
                if barang:
                    detail_dict["barang"] = {
                        "id": barang.id,
                        "nama": barang.nama,
                        "stok": barang.stok,
                        "satuan": barang.satuan,
                        "lokasi": barang.lokasi
                    }
            elif detail.reference_type == ReferenceTypeEnum.kelas:
                kelas = db.query(Kelas).filter(Kelas.id == detail.reference_id).first()
                if kelas:
                    detail_dict["kelas"] = {
                        "id": kelas.id,
                        "nama_kelas": kelas.nama_kelas,
                        "gedung": kelas.gedung,
                        "lantai": kelas.lantai,
                        "kapasitas": kelas.kapasitas
                    }
            elif detail.reference_type == ReferenceTypeEnum.absen:
                absen = db.query(Absen).filter(Absen.id == detail.reference_id).first()
                if absen:
                    detail_dict["absen"] = {
                        "id": absen.id,
                        "nama_matakuliah": absen.nama_matakuliah,
                        "kelas": absen.kelas,
                        "dosen": absen.dosen,
                        "jurusan": absen.jurusan,
                        "semester": absen.semester
                    }
            
            expanded_details.append(detail_dict)
        
        data.details = expanded_details
        result.append(data)
    
    return result

@router.get("/staff/history", response_model=dict)
def get_history_peminjaman_staff(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: StatusPeminjamanEnum = Query(None, description="Filter by status"),
    tanggal_mulai: date = Query(None, description="Filter from date"),
    tanggal_akhir: date = Query(None, description="Filter to date"),
    search: str = Query(None, description="Search by user name or nim"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Get riwayat peminjaman untuk staff dengan pagination dan filter"""
    skip = (page - 1) * per_page
    query = db.query(Peminjaman)
    
    # Apply filters
    if status:
        query = query.filter(Peminjaman.status == status)
    if tanggal_mulai:
        query = query.filter(Peminjaman.tanggal_peminjaman >= tanggal_mulai)
    if tanggal_akhir:
        query = query.filter(Peminjaman.tanggal_peminjaman <= tanggal_akhir)
    if search:
        # Join dengan User untuk search by name/nim
        query = query.join(User).filter(
            (User.name.ilike(f"%{search}%")) | 
            (User.nim.ilike(f"%{search}%"))
        )
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    peminjaman_list = query.order_by(Peminjaman.created_at.desc()).offset(skip).limit(per_page).all()
    
    # Build response
    items = []
    for p in peminjaman_list:
        data = PeminjamanResponse.from_orm(p)
        if p.user:
            data.user_name = p.user.name
            data.user_nim = p.user.nim
        if p.approver:
            data.approver_name = p.approver.name
        
        # Expand details dengan item info (sama seperti today endpoint)
        expanded_details = []
        for detail in p.details:
            detail_dict = {
                "id": detail.id,
                "reference_type": detail.reference_type,
                "reference_id": detail.reference_id,
                "jumlah": detail.jumlah,
                "waktu_mulai": detail.waktu_mulai,
                "waktu_selesai": detail.waktu_selesai,
            }
            
            if detail.reference_type == ReferenceTypeEnum.barang:
                barang = db.query(Barang).filter(Barang.id == detail.reference_id).first()
                if barang:
                    detail_dict["barang"] = {
                        "id": barang.id,
                        "nama": barang.nama,
                        "stok": barang.stok,
                        "satuan": barang.satuan,
                        "lokasi": barang.lokasi
                    }
            elif detail.reference_type == ReferenceTypeEnum.kelas:
                kelas = db.query(Kelas).filter(Kelas.id == detail.reference_id).first()
                if kelas:
                    detail_dict["kelas"] = {
                        "id": kelas.id,
                        "nama_kelas": kelas.nama_kelas,
                        "gedung": kelas.gedung,
                        "lantai": kelas.lantai,
                        "kapasitas": kelas.kapasitas
                    }
            elif detail.reference_type == ReferenceTypeEnum.absen:
                absen = db.query(Absen).filter(Absen.id == detail.reference_id).first()
                if absen:
                    detail_dict["absen"] = {
                        "id": absen.id,
                        "nama_matakuliah": absen.nama_matakuliah,
                        "kelas": absen.kelas,
                        "dosen": absen.dosen,
                        "jurusan": absen.jurusan,
                        "semester": absen.semester
                    }
            
            expanded_details.append(detail_dict)
        
        data.details = expanded_details
        items.append(data)
    
    return {
        "status": "success",
        "message": "History retrieved successfully",
        "data": {
            "items": items,
            "pagination": {
                "current_page": page,
                "per_page": per_page,
                "total": total,
                "last_page": (total + per_page - 1) // per_page,
                "from": skip + 1 if items else 0,
                "to": skip + len(items)
            }
        }
    }

@router.get("/staff/statistics", response_model=dict)
def get_peminjaman_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Get statistik peminjaman untuk staff dashboard"""
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    # Today stats
    today_total = db.query(Peminjaman).filter(
        Peminjaman.tanggal_peminjaman == today
    ).count()
    
    today_pending = db.query(Peminjaman).filter(
        Peminjaman.tanggal_peminjaman == today,
        Peminjaman.status == StatusPeminjamanEnum.pending
    ).count()
    
    today_approved = db.query(Peminjaman).filter(
        Peminjaman.tanggal_peminjaman == today,
        Peminjaman.status == StatusPeminjamanEnum.disetujui
    ).count()
    
    # Weekly stats
    week_total = db.query(Peminjaman).filter(
        Peminjaman.tanggal_peminjaman >= week_ago
    ).count()
    
    # Monthly stats
    month_total = db.query(Peminjaman).filter(
        Peminjaman.tanggal_peminjaman >= month_ago
    ).count()
    
    # Overall pending
    all_pending = db.query(Peminjaman).filter(
        Peminjaman.status == StatusPeminjamanEnum.pending
    ).count()
    
    return {
        "today": {
            "total": today_total,
            "pending": today_pending,
            "approved": today_approved,
            "rejected": today_total - today_pending - today_approved
        },
        "week": {
            "total": week_total
        },
        "month": {
            "total": month_total
        },
        "overall": {
            "pending": all_pending
        }
    }

@router.get("/", response_model=List[PeminjamanResponse])
def get_all_peminjaman_staff(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: StatusPeminjamanEnum = Query(None, description="Filter by status"),
    tanggal_mulai: date = Query(None, description="Filter from date"),
    tanggal_akhir: date = Query(None, description="Filter to date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Get semua peminjaman untuk staff dengan filter"""
    skip = (page - 1) * per_page
    query = db.query(Peminjaman)
    
    # Apply filters
    if status:
        query = query.filter(Peminjaman.status == status)
    if tanggal_mulai:
        query = query.filter(Peminjaman.tanggal_peminjaman >= tanggal_mulai)
    if tanggal_akhir:
        query = query.filter(Peminjaman.tanggal_peminjaman <= tanggal_akhir)
    
    peminjaman_list = query.order_by(Peminjaman.created_at.desc()).offset(skip).limit(per_page).all()
    
    # Expand dengan user info
    result = []
    for p in peminjaman_list:
        data = PeminjamanResponse.from_orm(p)
        if p.user:
            data.user_name = p.user.name
            data.user_nim = p.user.nim
        if p.approver:
            data.approver_name = p.approver.name
        data.details = [detail for detail in p.details]
        result.append(data)
    
    return result

@router.get("/pending", response_model=List[PeminjamanResponse])
def get_pending_peminjaman(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Get peminjaman yang menunggu approval"""
    skip = (page - 1) * per_page
    peminjaman_list = db.query(Peminjaman).filter(
        Peminjaman.status == StatusPeminjamanEnum.pending
    ).order_by(Peminjaman.created_at.asc()).offset(skip).limit(per_page).all()
    
    result = []
    for p in peminjaman_list:
        data = PeminjamanResponse.from_orm(p)
        if p.user:
            data.user_name = p.user.name
            data.user_nim = p.user.nim
        data.details = [detail for detail in p.details]
        result.append(data)
    
    return result

@router.get("/{peminjaman_id}", response_model=PeminjamanWithItemsResponse)
def get_peminjaman_detail(
    peminjaman_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Staff atau mahasiswa pemilik
):
    """Get detail peminjaman dengan expanded items"""
    peminjaman = db.query(Peminjaman).filter(Peminjaman.id == peminjaman_id).first()
    if not peminjaman:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Peminjaman tidak ditemukan"
        )
    
    # Check permission
    if current_user.role != RoleEnum.staff and peminjaman.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda hanya bisa melihat peminjaman sendiri"
        )
    
    # Build response
    data = PeminjamanWithItemsResponse.from_orm(peminjaman)
    if peminjaman.user:
        data.user_name = peminjaman.user.name
        data.user_nim = peminjaman.user.nim
    if peminjaman.approver:
        data.approver_name = peminjaman.approver.name
    
    data.items = expand_peminjaman_items(peminjaman, db)
    return data

@router.put("/{peminjaman_id}/approve", response_model=PeminjamanResponse)
def approve_peminjaman(
    peminjaman_id: int,
    approval_data: PeminjamanApprovalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Approve atau reject peminjaman (Staff only)"""
    peminjaman = db.query(Peminjaman).filter(Peminjaman.id == peminjaman_id).first()
    if not peminjaman:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Peminjaman tidak ditemukan"
        )
    
    # Staff bisa proses: pending → disetujui/ditolak, atau disetujui → dikembalikan
    if peminjaman.status not in [StatusPeminjamanEnum.pending, StatusPeminjamanEnum.disetujui]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Peminjaman dengan status '{peminjaman.status}' tidak bisa diproses"
        )
    
    # Validasi status yang dibolehkan berdasarkan status saat ini
    allowed_transitions = {
        StatusPeminjamanEnum.pending: [StatusPeminjamanEnum.disetujui, StatusPeminjamanEnum.ditolak],
        StatusPeminjamanEnum.disetujui: [StatusPeminjamanEnum.dikembalikan]
    }
    
    if approval_data.status not in allowed_transitions.get(peminjaman.status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tidak bisa mengubah status dari '{peminjaman.status}' ke '{approval_data.status}'"
        )
    
    # Update peminjaman
    old_status = peminjaman.status
    peminjaman.status = approval_data.status
    peminjaman.approved_by = current_user.id
    if approval_data.notes:
        peminjaman.notes = approval_data.notes
    
    # Generate verification code jika disetujui (dari pending)
    if old_status == StatusPeminjamanEnum.pending and approval_data.status == StatusPeminjamanEnum.disetujui:
        peminjaman.verification_code = generate_verification_code()
        
        # Update status barang/kelas yang dipinjam
        for detail in peminjaman.details:
            if detail.reference_type == ReferenceTypeEnum.barang:
                barang = db.query(Barang).filter(Barang.id == detail.reference_id).first()
                if barang and detail.jumlah:
                    barang.stok = max(0, barang.stok - detail.jumlah)
                    if barang.stok == 0:
                        barang.status = StatusBarangEnum.dipinjam
            # Kelas tidak perlu update status (time-based)
            elif detail.reference_type == ReferenceTypeEnum.absen:
                absen = db.query(Absen).filter(Absen.id == detail.reference_id).first()
                if absen:
                    absen.status = StatusBarangEnum.dipinjam
    
    # Kembalikan barang/kelas jika dikembalikan
    elif approval_data.status == StatusPeminjamanEnum.dikembalikan:
        for detail in peminjaman.details:
            if detail.reference_type == ReferenceTypeEnum.barang:
                barang = db.query(Barang).filter(Barang.id == detail.reference_id).first()
                if barang and detail.jumlah:
                    barang.stok += detail.jumlah
                    barang.status = StatusBarangEnum.tersedia
            # Kelas tidak perlu update status (time-based)
            elif detail.reference_type == ReferenceTypeEnum.absen:
                # ADD: Update absen status back to tersedia
                absen = db.query(Absen).filter(Absen.id == detail.reference_id).first()
                if absen:
                    absen.status = StatusBarangEnum.tersedia
    
    db.commit()
    db.refresh(peminjaman)
    
    # Build response
    data = PeminjamanResponse.from_orm(peminjaman)
    if peminjaman.user:
        data.user_name = peminjaman.user.name
        data.user_nim = peminjaman.user.nim
    if peminjaman.approver:
        data.approver_name = peminjaman.approver.name
    data.details = [detail for detail in peminjaman.details]
    
    return data

@router.delete("/{peminjaman_id}")
def delete_peminjaman(
    peminjaman_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff)
):
    """Delete peminjaman (Staff only)"""
    peminjaman = db.query(Peminjaman).filter(Peminjaman.id == peminjaman_id).first()
    if not peminjaman:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Peminjaman tidak ditemukan"
        )
    
    db.delete(peminjaman)
    db.commit()
    return {"message": "Peminjaman berhasil dihapus"}