# app/models.py
from sqlalchemy import Column, Integer, String, Enum, DateTime
from app.database import Base
import enum
from datetime import datetime

class RoleEnum(str, enum.Enum):
    mahasiswa = "mahasiswa"
    staff = "staff"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nim = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(Enum(RoleEnum))
    kode_akses = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Barang(Base):
    __tablename__ = "barang"
    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String)
    satuan = Column(String)
    stok = Column(Integer)
    status = Column(String)  # bisa pakai enum juga
    lokasi = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
