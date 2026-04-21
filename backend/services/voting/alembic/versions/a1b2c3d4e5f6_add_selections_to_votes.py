"""add selections to votes

Revision ID: a1b2c3d4e5f6
Revises: 954d7a60988e
Create Date: 2026-04-21 17:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '954d7a60988e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add selections column
    op.add_column('votes', sa.Column('selections', postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    
    # 2. Drop old columns
    op.drop_column('votes', 'position_id')
    op.drop_column('votes', 'candidate_id')


def downgrade() -> None:
    op.add_column('votes', sa.Column('candidate_id', sa.UUID(), autoincrement=False, nullable=False))
    op.add_column('votes', sa.Column('position_id', sa.UUID(), autoincrement=False, nullable=False))
    op.drop_column('votes', 'selections')
