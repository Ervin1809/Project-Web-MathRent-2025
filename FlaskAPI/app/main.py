# app/main.py
from fastapi import FastAPI
from app import models
from app.database import engine
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas, database

app = FastAPI()

# Buat tabel-tabel di database saat pertama kali jalan
models.Base.metadata.create_all(bind=engine)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=list[schemas.UserResponse])
def read_users(db: Session = Depends(get_db)):
    return crud.get_users(db)

@app.get("/")
def read_root():
    return {"message": "API Barang & Peminjaman aktif!"}
