from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Text, Date, CheckConstraint
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from datetime import datetime

# === ENUMS ===
class RoleEnum(str, enum.Enum):
    mahasiswa = "mahasiswa"
    staff = "staff"

class StatusBarangEnum(str, enum.Enum):
    tersedia = "tersedia"
    dipinjam = "dipinjam" 
    maintenance = "maintenance"

class StatusPeminjamanEnum(str, enum.Enum):
    pending = "pending"
    disetujui = "disetujui"
    ditolak = "ditolak"
    dikembalikan = "dikembalikan"

class ReferenceTypeEnum(str, enum.Enum):
    barang = "barang"
    kelas = "kelas"
    absen = "absen"

# === MODELS ===
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    nim = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(Enum(RoleEnum))
    kode_akses = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    peminjaman_dibuat = relationship("Peminjaman", foreign_keys="Peminjaman.user_id", back_populates="user")
    peminjaman_disetujui = relationship("Peminjaman", foreign_keys="Peminjaman.approved_by", back_populates="approver")

class Barang(Base):
    __tablename__ = "barang"
    
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String)
    satuan = Column(String)  # unit, rim, dll
    stok = Column(Integer)
    status = Column(Enum(StatusBarangEnum), default=StatusBarangEnum.tersedia)
    lokasi = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Kelas(Base):
    __tablename__ = "kelas"
    
    id = Column(Integer, primary_key=True, index=True)
    nama_kelas = Column(String)  # 204, 205, dll
    gedung = Column(String)
    lantai = Column(Integer)
    kapasitas = Column(Integer)
    fasilitas = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Absen(Base):
    __tablename__ = "absen"
    
    id = Column(Integer, primary_key=True, index=True)
    nama_matakuliah = Column(String)
    kelas = Column(String)  # A, B, C
    semester = Column(Integer)
    dosen = Column(String)
    jurusan = Column(String)
    status = Column(Enum(StatusBarangEnum), nullable=False, default=StatusBarangEnum.tersedia)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Peminjaman(Base):
    __tablename__ = "peminjaman"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tanggal_peminjaman = Column(Date)
    status = Column(Enum(StatusPeminjamanEnum), default=StatusPeminjamanEnum.pending)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verification_code = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="peminjaman_dibuat")
    approver = relationship("User", foreign_keys=[approved_by], back_populates="peminjaman_disetujui")
    details = relationship("PeminjamanDetail", back_populates="peminjaman", cascade="all, delete-orphan")

class PeminjamanDetail(Base):
    __tablename__ = "peminjaman_detail"
    
    id = Column(Integer, primary_key=True, index=True)
    peminjaman_id = Column(Integer, ForeignKey("peminjaman.id"))
    reference_type = Column(Enum(ReferenceTypeEnum), index=True)
    reference_id = Column(Integer, index=True)  # ID dari table terkait
    jumlah = Column(Integer, nullable=True)  # Untuk barang saja
    waktu_mulai = Column(DateTime, nullable=True)  # Untuk kelas saja
    waktu_selesai = Column(DateTime, nullable=True)  # Untuk kelas saja
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Table constraints untuk validasi
    __table_args__ = (
        CheckConstraint(
            "(reference_type = 'barang' AND jumlah IS NOT NULL) OR "
            "(reference_type = 'kelas' AND waktu_mulai IS NOT NULL AND waktu_selesai IS NOT NULL) OR "
            "(reference_type = 'absen')",
            name='check_reference_type_constraints'
        ),
    )
    
    # Relationships
    peminjaman = relationship("Peminjaman", back_populates="details")
    
    def get_referenced_item(self, db_session):
        """
        Dynamically get the referenced item based on reference_type
        
        Args:
            db_session: SQLAlchemy database session
            
        Returns:
            Barang|Kelas|Absen|None: The referenced item or None if not found
        """
        if self.reference_type == ReferenceTypeEnum.barang:
            return db_session.query(Barang).filter(Barang.id == self.reference_id).first()
        elif self.reference_type == ReferenceTypeEnum.kelas:
            return db_session.query(Kelas).filter(Kelas.id == self.reference_id).first()
        elif self.reference_type == ReferenceTypeEnum.absen:
            return db_session.query(Absen).filter(Absen.id == self.reference_id).first()
        return None
    
    def get_referenced_item_with_type(self, db_session):
        """
        Get referenced item with its type information
        
        Returns:
            dict: {'type': str, 'item': object, 'details': dict}
        """
        item = self.get_referenced_item(db_session)
        if not item:
            return None
            
        result = {
            'type': self.reference_type.value,
            'item': item,
            'details': {}
        }
        
        # Add type-specific details
        if self.reference_type == ReferenceTypeEnum.barang:
            result['details'] = {
                'jumlah': self.jumlah,
                'satuan': item.satuan if hasattr(item, 'satuan') else None
            }
        elif self.reference_type == ReferenceTypeEnum.kelas:
            result['details'] = {
                'waktu_mulai': self.waktu_mulai,
                'waktu_selesai': self.waktu_selesai,
                'durasi_jam': self._calculate_duration() if self.waktu_mulai and self.waktu_selesai else None
            }
        elif self.reference_type == ReferenceTypeEnum.absen:
            result['details'] = {
                'mata_kuliah': item.nama_matakuliah if hasattr(item, 'nama_matakuliah') else None,
                'kelas': item.kelas if hasattr(item, 'kelas') else None
            }
            
        return result
    
    def _calculate_duration(self):
        """Calculate duration in hours between waktu_mulai and waktu_selesai"""
        if self.waktu_mulai and self.waktu_selesai:
            delta = self.waktu_selesai - self.waktu_mulai
            return round(delta.total_seconds() / 3600, 2)
        return None
    
    @property
    def is_barang(self):
        """Check if this detail is for barang"""
        return self.reference_type == ReferenceTypeEnum.barang
    
    @property
    def is_kelas(self):
        """Check if this detail is for kelas"""
        return self.reference_type == ReferenceTypeEnum.kelas
    
    @property
    def is_absen(self):
        """Check if this detail is for absen"""
        return self.reference_type == ReferenceTypeEnum.absen