from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
import re

# Security Configuration
SECRET_KEY = "your-secret-key-here-make-it-strong-in-production"  # Ganti dengan key yang kuat
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        nim: str = payload.get("sub")
        if nim is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return nim
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def validate_nim_format(nim: str) -> dict:
    """
    Validate NIM format for Departemen Matematika UNHAS
    
    Format: H{KODE_PRODI}YYXXXX
    Kode Prodi yang diizinkan:
    - H011 = Matematika Sarjana
    - H081 = Aktuaria Sarjana  
    - H012 = Matematika Magister
    - H013 = Matematika Doktor
    - H071 = Sistem Informasi Sarjana
    
    YY = tahun angkatan (2 digit)
    XXXX = nomor urut mahasiswa
    
    Returns:
        dict: {'valid': bool, 'info': dict} containing validation result and NIM info
    """
    
    # Mapping kode prodi
    PRODI_MAP = {
        'H011': {
            'nama': 'Matematika',
            'jenjang': 'Sarjana',
            'fakultas': 'MIPA',
            'range_nomor': r'10[0-9][0-9]'  # 1000-1099 (contoh range)
        },
        'H081': {
            'nama': 'Aktuaria', 
            'jenjang': 'Sarjana',
            'fakultas': 'MIPA',
            'range_nomor': r'10[0-9][0-9]'  # 1000-1099
        },
        'H012': {
            'nama': 'Matematika',
            'jenjang': 'Magister', 
            'fakultas': 'MIPA',
            'range_nomor': r'10[0-9][0-9]'  # 1000-1099
        },
        'H013': {
            'nama': 'Matematika',
            'jenjang': 'Doktor',
            'fakultas': 'MIPA', 
            'range_nomor': r'10[0-9][0-9]'  # 1000-1099
        },
        'H071': {
            'nama': 'Sistem Informasi',
            'jenjang': 'Sarjana',
            'fakultas': 'MIPA',
            'range_nomor': r'(10[0-9][0-9]|109[0-2])'  # 1000-1092
        }
    }
    
    # Extract kode prodi
    if len(nim) < 4:
        return {'valid': False, 'info': None, 'error': 'NIM terlalu pendek'}
    
    kode_prodi = nim[:4]
    
    if kode_prodi not in PRODI_MAP:
        return {
            'valid': False, 
            'info': None, 
            'error': f'Kode prodi {kode_prodi} tidak diizinkan. Hanya mahasiswa Departemen Matematika yang dapat mendaftar.'
        }
    
    prodi_info = PRODI_MAP[kode_prodi]
    
    # Construct full pattern
    pattern = f'^{kode_prodi}\\d{{2}}{prodi_info["range_nomor"]}$'
    
    if not re.match(pattern, nim):
        return {
            'valid': False,
            'info': prodi_info,
            'error': f'Format NIM tidak valid untuk {prodi_info["nama"]} {prodi_info["jenjang"]}. Format: {kode_prodi}YYXXXX'
        }
    
    # Extract year and number
    tahun = nim[4:6]
    nomor = nim[6:]
    
    return {
        'valid': True,
        'info': {
            'kode_prodi': kode_prodi,
            'prodi': prodi_info['nama'],
            'jenjang': prodi_info['jenjang'], 
            'fakultas': prodi_info['fakultas'],
            'tahun': f'20{tahun}',
            'nomor_urut': nomor,
            'angkatan': f'20{tahun}'
        },
        'error': None
    }

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    nim = verify_token(token)
    user = db.query(User).filter(User.nim == nim).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Get current active user (for future use if needed)"""
    return current_user

def require_staff(current_user: User = Depends(get_current_user)):
    """Require staff role"""
    if current_user.role != "staff":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Staff role required."
        )
    return current_user