from fastapi import FastAPI

app = FastAPI(title="HIRALL Python Service")


@app.get("/health")
def health():
    return {"status": "ok", "service": "hirall-api-python"}


@app.get("/modules")
def modules():
    return {
        "modules": ["POS", "Cashier", "Store", "Manager", "HR"],
        "phase": "HIRALL POS v1",
    }


@app.get("/sync/health")
def sync_health():
    return {"status": "ready", "mode": "sync-stub"}
