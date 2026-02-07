from fastapi import FastAPI

app = FastAPI(title="HIRALL Python Service")


@app.get("/health")
def health():
    return {"status": "ok", "service": "hirall-api-python"}


@app.get("/modules")
def modules():
    return {
        "modules": ["POS", "Cashier", "Store", "Manager"],
        "phase": "HIRALL POS v1",
    }
