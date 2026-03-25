from sqlalchemy.orm import declarative_base

Base = declarative_base()

# 🔥 Import models so Alembic detects them
from app.models import (
    voting_token,
    vote,
    vote_participation,
    blockchain_anchor,
)