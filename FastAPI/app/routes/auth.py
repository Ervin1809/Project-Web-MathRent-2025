from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models import User, RoleEnum
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token, 
    validate_nim_format,
    get_current_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register new mahasiswa Departemen Matematika"""
    
    # Check if NIM already exists
    existing_user = db.query(User).filter(User.nim == user_data.nim).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NIM sudah terdaftar"
        )
    
    # Validate NIM format (sudah divalidasi di schema, tapi double check)
    nim_validation = validate_nim_format(user_data.nim)
    if not nim_validation['valid']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=nim_validation['error']
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.kode_akses)
    db_user = User(
        nim=user_data.nim,
        name=user_data.name,
        role=RoleEnum.mahasiswa,  # Default role untuk registrasi
        kode_akses=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/validate-nim/{nim}")
def validate_nim_info(nim: str):
    """Get NIM validation info"""
    result = validate_nim_format(nim)
    return result

@router.post("/login", response_model=Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login mahasiswa/staff"""
    
    # Find user by NIM (using username field from OAuth2PasswordRequestForm)
    user = db.query(User).filter(User.nim == form_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="NIM atau kode akses salah",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(form_data.password, user.kode_akses):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="NIM atau kode akses salah",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.nim, "role": user.role.value}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # in seconds
        "user": user
    }

@router.post("/login-simple", response_model=Token)
def login_simple(user_data: UserLogin, db: Session = Depends(get_db)):
    """Alternative login endpoint with JSON body"""
    
    # Find user by NIM
    user = db.query(User).filter(User.nim == user_data.nim).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="NIM atau kode akses salah"
        )
    
    # Verify password
    if not verify_password(user_data.kode_akses, user.kode_akses):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="NIM atau kode akses salah"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.nim, "role": user.role.value}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.post("/logout")
def logout_user():
    """Logout user (client-side token removal)"""
    return {"message": "Successfully logged out. Please remove token from client."}



@router.post("/create-staff", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_staff_user(user_data: UserRegister, db: Session = Depends(get_db)):
    """Create staff user - FOR TESTING ONLY"""
    
    # Cek NIM sudah ada atau belum
    existing_user = db.query(User).filter(User.nim == user_data.nim).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NIM sudah terdaftar"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.kode_akses)
    db_user = User(
        nim=user_data.nim,
        name=user_data.name,
        role=RoleEnum.staff,  # staff
        kode_akses=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user