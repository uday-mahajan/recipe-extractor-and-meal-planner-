from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import recipes

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Recipe Extractor API",
    description="Scrapes recipe blog URLs and extracts structured data using Claude LLM.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(recipes.router)


@app.get("/health")
def health():
    return {"status": "ok"}
