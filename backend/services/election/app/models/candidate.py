import uuid
from sqlalchemy import Column, String, ForeignKey, Text
from app.db.base import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    position_id = Column(String, ForeignKey("positions.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    biography = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
