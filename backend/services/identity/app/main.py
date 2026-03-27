from app.api.v1.identity import router as identity_router
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Identity Service")

from app.db.base import Base
from app.db.session import engine
Base.metadata.create_all(bind=engine)

API_ENV = os.getenv("API_ENV", "development")
CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:3000")

# Root endpoint for health check
@app.get("/")
def read_root():
    return {"status": "Identity Service is running", "env": API_ENV}


# Include versioned API router
app.include_router(identity_router, prefix="/api/v1/identity", tags=["identity"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
