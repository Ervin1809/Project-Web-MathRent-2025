from fastapi import FastAPI
from app.routes import auth
from app.routes import barang
from app.routes import kelas
from app.routes import absen
from app.routes import peminjaman
from app.database import engine
from app.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sistem Peminjaman Depart Math",
    description="API untuk sistem peminjaman barang, kelas, dan absen",
    version="1.0.0"
)

# Include routers
app.include_router(auth.router)
app.include_router(barang.router)
app.include_router(kelas.router)
app.include_router(absen.router)
app.include_router(peminjaman.router)

@app.get("/")
def root():
    return {"message": "Sistem Peminjaman Depart Math API"}