import os
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 🔥 Get DB URL from env
DATABASE_URL = os.environ["DATABASE_URL"]

# 🔥 Retry DB connection (VERY IMPORTANT for Docker)
for i in range(10):
    try:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,   # 🔥 avoids stale connections
            pool_size=5,
            max_overflow=10
        )
        conn = engine.connect()
        conn.close()
        print("✅ Database connected")
        break
    except Exception as e:
        print(f"⏳ DB not ready, retrying... ({i+1}/10)")
        time.sleep(3)
else:
    raise Exception("❌ Could not connect to database")

# 🔥 Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# 🔥 FastAPI dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()