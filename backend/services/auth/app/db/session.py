import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# Database URL from root docker-compose or fallback for standalone local dev
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg2://onevote:onevote@postgres:5432/auth_db"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
