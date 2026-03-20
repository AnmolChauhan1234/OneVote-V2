from fastapi import FastAPI
from app.api.v1 import voting

app = FastAPI(title="Voting Service")

app.include_router(voting.router, prefix="/api/v1/voting")