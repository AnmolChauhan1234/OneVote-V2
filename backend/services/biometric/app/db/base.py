from sqlalchemy.orm import declarative_base

Base = declarative_base()

# 🔥 Auto-load all models for Alembic
import app.models