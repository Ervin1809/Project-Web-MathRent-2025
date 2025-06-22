from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Vite dev server
        "http://127.0.0.1:5173",     # Alternative localhost
        "http://localhost:3000",      # React dev server
        "http://127.0.0.1:3000"      # Alternative
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
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