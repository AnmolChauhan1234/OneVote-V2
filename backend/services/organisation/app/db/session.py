import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Expecting DATABASE_URL to be set in environment variables
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://onevote:onevote@postgres:5432/voting_db")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
