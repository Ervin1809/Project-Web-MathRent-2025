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
                
            # Cek ketersediaan kelas
            kelas = db.query(Kelas).filter(Kelas.id == detail.reference_id).first()
            if not kelas:
                errors.append(f"Item {i+1}: Kelas dengan ID {detail.reference_id} tidak ditemukan")
            elif kelas.status != StatusBarangEnum.tersedia:
                errors.append(f"Item {i+1}: Kelas '{kelas.nama_kelas}' tidak tersedia")
                
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
    per_page: int = Query(10, ge=1, le=100),
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

# === ENDPOINTS UNTUK STAFF ===

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
            elif detail.reference_type == ReferenceTypeEnum.kelas:
                kelas = db.query(Kelas).filter(Kelas.id == detail.reference_id).first()
                if kelas:
                    kelas.status = StatusBarangEnum.dipinjam
    
    # Kembalikan barang/kelas jika dikembalikan
    elif approval_data.status == StatusPeminjamanEnum.dikembalikan:
        for detail in peminjaman.details:
            if detail.reference_type == ReferenceTypeEnum.barang:
                barang = db.query(Barang).filter(Barang.id == detail.reference_id).first()
                if barang and detail.jumlah:
                    barang.stok += detail.jumlah
                    barang.status = StatusBarangEnum.tersedia
            elif detail.reference_type == ReferenceTypeEnum.kelas:
                kelas = db.query(Kelas).filter(Kelas.id == detail.reference_id).first()
                if kelas:
                    kelas.status = StatusBarangEnum.tersedia
    
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