"""Demand Prediction Router for SalesSphere Sales Manager Portal.
Provides endpoints for:
- Retrieving trained Decision Tree model metadata, evaluation metrics, and tree graph structure.
- Executing live new product demand predictions.
- Approving and publishing manager-reviewed products to the live catalogue & Data Warehouse.
- Viewing prediction audit history.
"""

import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field

from backend.lib.manager_auth import get_current_manager, require_manager
from backend.lib.db import (
    save_demand_prediction, list_demand_predictions, get_demand_prediction,
    update_demand_prediction_status, create_op_product, get_product_by_id
)
from backend.warehouse import add_dw_product_and_variants
from backend.demand_ml import (
    get_model_metadata, predict_new_product_demand, train_and_cache_model
)

router = APIRouter(prefix="/manager/demand", tags=["demand_predictor"])

class DemandPredictIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(default="")
    category: str = Field(pattern="^(Men|Women|Kids|Home|Home Essentials|men|women|kids|home|home-essentials)$")
    subcategory: str = Field(min_length=2, max_length=50)
    brand: str = Field(default="Salesphere Luxe", min_length=2, max_length=60)
    collection: Optional[str] = Field(default="Western", description="Western, Traditional, or Home Essentials")
    price: float = Field(gt=0, description="Selling price in INR")
    discount_percentage: float = Field(default=0.0, ge=0.0, le=80.0)
    sizes: List[str] = Field(default=["S", "M", "L", "XL"])
    color: str = Field(default="Classic Black")
    fabric: Optional[str] = Field(default=None)
    material: Optional[str] = Field(default=None)
    room: Optional[str] = Field(default=None)
    sleeve_type: Optional[str] = Field(default=None)
    pattern: Optional[str] = Field(default=None)
    occasion: Optional[str] = Field(default=None)
    dimensions: Optional[str] = Field(default=None)
    launch_month: int = Field(default=3, ge=1, le=12)
    season: Optional[str] = None
    proposed_stock: int = Field(default=100, ge=1, le=10000)
    target_customer: Optional[str] = Field(default="Festive, Wedding & Cultural Celebrants")
    marketing_budget: Optional[float] = Field(default=None, ge=0)
    image_url: Optional[str] = None

class ApproveLaunchIn(BaseModel):
    prediction_id: Optional[str] = None
    name: str = Field(min_length=2, max_length=120)
    description: str = Field(default="")
    category: str = Field(pattern="^(Men|Women|Kids|Home|Home Essentials|men|women|kids|home|home-essentials)$")
    subcategory: str = Field(min_length=2, max_length=50)
    brand: str = Field(default="Salesphere Luxe", min_length=2, max_length=60)
    collection: Optional[str] = Field(default="Western")
    price: float = Field(gt=0)
    discount_percentage: float = Field(default=0.0, ge=0.0, le=80.0)
    sizes: List[str] = Field(min_length=1)
    color: str = Field(default="Classic Black")
    fabric: Optional[str] = Field(default=None)
    material: Optional[str] = Field(default=None)
    room: Optional[str] = Field(default=None)
    launch_month: int = Field(default=3, ge=1, le=12)
    season: Optional[str] = None
    approved_stock: int = Field(gt=0, le=10000, description="Manager-approved initial inventory quantity")
    image_url: Optional[str] = None

@router.get("/model")
async def get_demand_model_info(manager = Depends(get_current_manager)) -> Dict[str, Any]:
    """Returns trained Decision Tree metrics, confusion matrix, feature importances, and tree graph."""
    return get_model_metadata()

@router.post("/retrain")
async def retrain_demand_model(manager = Depends(get_current_manager)) -> Dict[str, Any]:
    """Triggers an authoritative retraining of the Decision Tree on current transactions."""
    train_and_cache_model(force_retrain=True)
    return get_model_metadata()

@router.post("/predict")
async def predict_demand(input_data: DemandPredictIn, manager = Depends(get_current_manager)) -> Dict[str, Any]:
    """
    Evaluates proposed product attributes using the trained Decision Tree.
    Returns predicted 30-day demand units, demand tier, class probabilities,
    inventory gap analysis, and launch recommendation.
    Persists an audit record in op_demand_predictions.
    """
    data_dict = input_data.model_dump()
    prediction_result = predict_new_product_demand(data_dict)

    # Persist prediction audit record in operational database
    audit_data = {
        "product_name": input_data.name,
        "category": input_data.category.capitalize(),
        "subcategory": input_data.subcategory.capitalize(),
        "brand": input_data.brand,
        "price": input_data.price,
        "discount_percentage": input_data.discount_percentage,
        "launch_month": input_data.launch_month,
        "season": prediction_result["season"],
        "sizes": input_data.sizes,
        "color": input_data.color,
        "fabric": input_data.fabric,
        "image_url": input_data.image_url or "",
        "proposed_stock": input_data.proposed_stock,
        "predicted_units": prediction_result["predicted_units"],
        "demand_tier": prediction_result["demand_tier"],
        "probabilities": prediction_result["probabilities"],
        "suggested_stock": prediction_result["suggested_initial_stock"],
        "status": "Draft",
        "manager_email": getattr(manager, "email", "admin@salesphere.in")
    }
    saved = save_demand_prediction(audit_data)
    prediction_result["prediction_id"] = saved["id"]
    return prediction_result

@router.post("/approve-launch")
async def approve_product_launch(input_data: ApproveLaunchIn, manager = Depends(get_current_manager)) -> Dict[str, Any]:
    """
    Explicit Manager Approval:
    1. Validates manager-approved initial stock.
    2. Integrates product into operational.db (op_products) tagged with 'New Launch'.
    3. Integrates product into ecommerce_dw.db Star Schema (dim_product and dim_product_variants).
    4. Updates prediction audit record in op_demand_predictions to 'Approved'.
    5. Makes the product immediately browseable, searchable, and purchasable on the storefront!
    """
    cat_raw = input_data.category.strip().lower()
    if "home" in cat_raw:
        cat_clean = "Home Essentials"
        cat_lower = "home"
        fallback_img = "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80"
    elif cat_raw == "men":
        cat_clean = "Men"
        cat_lower = "men"
        fallback_img = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80"
    elif cat_raw == "kids":
        cat_clean = "Kids"
        cat_lower = "kids"
        fallback_img = "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&auto=format&fit=crop&q=80"
    else:
        cat_clean = "Women"
        cat_lower = "women"
        fallback_img = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80"

    subcat_clean = input_data.subcategory.strip().capitalize()

    # Calculate original price from discount
    unit_price = float(input_data.price)
    discount_pct = float(input_data.discount_percentage)
    original_price = round(unit_price / (1 - discount_pct / 100.0), 2) if discount_pct > 0 else unit_price

    # Generate deterministic SKU
    unique_hex = uuid.uuid4().hex[:4].upper()
    prefix = "HOM" if "home" in cat_lower else cat_clean[:3].upper()
    sku = f"SLSP-{prefix}-{subcat_clean[:3].upper()}-{unique_hex}"

    img_url = input_data.image_url or fallback_img
    material_desc = input_data.fabric or input_data.material or "premium materials"

    product_id = str(uuid.uuid4())
    op_product_payload = {
        "id": product_id,
        "sku": sku,
        "name": input_data.name.strip(),
        "description": input_data.description.strip() or f"New luxury {cat_clean} {subcat_clean} crafted from {material_desc}.",
        "category": cat_lower,
        "subcategory": subcat_clean.lower(),
        "price": unit_price,
        "original_price": original_price,
        "sizes": input_data.sizes,
        "colors": [input_data.color] if input_data.color else ["Classic Black"],
        "stock": input_data.approved_stock,
        "images": [img_url],
        "color_images": {input_data.color: img_url} if input_data.color else {},
        "rating": 5.0,
        "rating_count": 1,
        "tags": ["New Launch", "Trending", cat_lower],
        "is_active": True
    }

    # 1. Insert into operational catalogue (operational.db)
    created_prod = create_op_product(op_product_payload)

    # 2. Insert into Data Warehouse Star Schema (dim_product & dim_product_variants)
    dw_payload = {
        "sku": sku,
        "name": input_data.name.strip(),
        "category": cat_clean,
        "subcategory": subcat_clean,
        "brand": input_data.brand,
        "price": unit_price,
        "cost_price": round(unit_price * 0.45, 2),
        "discount_percentage": discount_pct,
        "season": input_data.season or "All-Season",
        "sizes": input_data.sizes,
        "color": input_data.color,
        "stock": input_data.approved_stock
    }
    dw_pid = add_dw_product_and_variants(dw_payload)

    # 3. Update prediction audit record if prediction_id provided
    if input_data.prediction_id:
        update_demand_prediction_status(
            pred_id=input_data.prediction_id,
            status="Approved",
            approved_stock=input_data.approved_stock,
            created_product_id=product_id
        )

    return {
        "status": "ok",
        "message": f"Product '{input_data.name}' successfully approved and launched with initial stock of {input_data.approved_stock} units.",
        "product_id": product_id,
        "dw_product_id": dw_pid,
        "sku": sku,
        "approved_stock": input_data.approved_stock,
        "category": cat_lower,
        "product_url": f"/product/{product_id}",
        "storefront_category_url": f"/{cat_lower}"
    }

@router.get("/history")
async def get_prediction_history(manager = Depends(get_current_manager)) -> List[Dict[str, Any]]:
    """Returns the chronological audit log of product demand predictions and launches."""
    return list_demand_predictions(limit=50)
