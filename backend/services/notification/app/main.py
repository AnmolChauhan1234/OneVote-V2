from fastapi import FastAPI

# from app.api.v1 import voting, voting_token

app = FastAPI(title="Notification Service")

# app.include_router(
#     ...,
#     prefix="/api/v1/notification",
#     tags=["notification"],
# )


@app.get("/health")
def health_check():
    return {"status": "ok"}
