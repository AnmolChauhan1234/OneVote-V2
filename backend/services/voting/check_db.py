from sqlalchemy import create_engine, text
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://onevote:onevote@localhost:5432/voting_db")

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Migrating 'votes' table...")
    try:
        # 1. Add selections column (JSONB for Postgres)
        conn.execute(text("ALTER TABLE votes ADD COLUMN selections JSONB"))
        print("Success: Added 'selections' column.")
    except Exception as e:
        print(f"Skipping: 'selections' column might already exist. ({e})")

    try:
        # 2. Drop old columns
        conn.execute(text("ALTER TABLE votes DROP COLUMN position_id"))
        conn.execute(text("ALTER TABLE votes DROP COLUMN candidate_id"))
        print("Success: Dropped obsolete 'position_id' and 'candidate_id' columns.")
    except Exception as e:
        print(f"Skipping: Old columns might already be dropped. ({e})")
    
    conn.commit()

print("Database migration complete.")
