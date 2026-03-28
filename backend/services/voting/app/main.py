from fastapi import FastAPI
from app.api.v1 import voting, voting_token, internal

app = FastAPI(title="Voting Service")

app.include_router(
    voting.router,
    prefix="/api/v1/voting",
    tags=["Voting"],
)

app.include_router(
    voting_token.router,
    prefix="/api/v1/token",
    tags=["Token"],
)
app.include_router(
    internal.router,
    prefix="/api/v1/internal",
    tags=["internal"],
)