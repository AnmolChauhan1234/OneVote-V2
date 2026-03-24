import uuid
from sqlalchemy import Column, String, Integer, ForeignKey, Text
from app.db.base import Base

class Position(Base):
    __tablename__ = "positions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    election_id = Column(String, ForeignKey("elections.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    max_candidates_selectable = Column(Integer, default=1, nullable=False)
