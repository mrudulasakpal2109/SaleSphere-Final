"""SalesSphere Backend API Server.
FastAPI service exposing:
- Customer Storefront APIs (/api/auth, /api/products, /api/addresses, /api/orders, /api/assistant, /api/media, /api/newsletter)
- Sales Manager Analytics Portal (/api/manager/...)
- Central DWM Pipeline & incremental warehouse ETL engine
"""

import sys
import os
from pathlib import Path
from contextlib import asynccontextmanager

# Add root directory to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Also add backend to sys.path for modules that import without backend prefix
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from pydantic import BaseModel
from datetime import datetime

from backend.lib.db import init_op_db
from backend.seed import seed_database
from backend.warehouse import init_data_warehouse

# Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure operational DB and DW tables are ready and seeded
    init_op_db()
    seed_database()
    init_data_warehouse(force_reseed=False)
    yield
    # Shutdown

app = FastAPI(title="SalesSphere API", version="2.0.0", lifespan=lifespan)

# Mount local photos directory for home essentials
photos_dir = ROOT_DIR / "frontend" / "photos_for_homeessential"
if photos_dir.exists():
    app.mount("/photos_for_homeessential", StaticFiles(directory=str(photos_dir)), name="photos_for_homeessential")

# CORS configuration for Vite frontend running on port 3000 or local dev ports
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

class HealthStatus(BaseModel):
    status: str
    timestamp: str
    version: str
    warehouse_dataset: str
    database: str

@api_router.get("/", response_model=HealthStatus)
@api_router.get("/status", response_model=HealthStatus)
async def health_check() -> HealthStatus:
    return HealthStatus(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="2.0.0",
        warehouse_dataset="salesphere_unified_dataset_v2.csv (48,500+ rows)",
        database="SQLite Star Schema (ecommerce_dw.db + operational.db)"
    )

# Register all SalesSphere routers
from backend.routers.auth import router as auth_router
from backend.routers.catalog import router as catalog_router
from backend.routers.addresses import router as addresses_router
from backend.routers.orders import router as orders_router
from backend.routers.media import router as media_router
from backend.routers.engagement import router as engagement_router
from backend.routers.assistant import router as assistant_router
from backend.routers.manager import router as manager_router
from backend.routers.demand import router as demand_router

api_router.include_router(auth_router)
api_router.include_router(catalog_router)
api_router.include_router(addresses_router)
api_router.include_router(orders_router)
api_router.include_router(media_router)
api_router.include_router(engagement_router)
api_router.include_router(assistant_router)
api_router.include_router(manager_router)
api_router.include_router(demand_router)

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8001, reload=True)
