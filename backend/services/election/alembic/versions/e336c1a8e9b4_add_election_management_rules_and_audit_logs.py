"""Add production-ready election management rules and audit logs

Revision ID: e336c1a8e9b4
Revises: c40065b47be5
Create Date: 2026-04-22 22:15:21.123456

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e336c1a8e9b4'
down_revision: Union[str, Sequence[str], None] = 'c40065b47be5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Adding new columns to elections table
    op.add_column('elections', sa.Column('manual_override', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('elections', sa.Column('override_reason', sa.String(length=500), nullable=True))
    op.add_column('elections', sa.Column('overridden_by', postgresql.UUID(as_uuid=True), nullable=True))

    # Creating audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=False),
        sa.Column('entity_id', sa.String(), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('performed_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('previous_values', sa.JSON(), nullable=True),
        sa.Column('new_values', sa.JSON(), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_column('elections', 'overridden_by')
    op.drop_column('elections', 'override_reason')
    op.drop_column('elections', 'manual_override')
