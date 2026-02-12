from fastapi import FastAPI

app = FastAPI(title="Voting Service")

@app.get("/health")
def health():
    return {"status": "ok"}
