from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database URL - gunakan SQLite untuk development
SQLALCHEMY_DATABASE_URL = "sqlite:///./mathrent.db"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Needed for SQLite
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency untuk mendapatkan database session
def get_db():
    """
    Dependency yang akan memberikan database session ke setiap request
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()