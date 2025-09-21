from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Read database URL from .env
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://user:password@localhost:5432/resume_db")

# Create engine (NO connect_args for PostgreSQL)
engine = create_engine(DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()

def init_db():
    # Create tables from models
    import src.db.models  # make sure models are imported here
    Base.metadata.create_all(bind=engine)