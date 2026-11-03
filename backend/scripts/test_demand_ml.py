import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.demand_ml import train_and_cache_model, predict_new_product_demand

print("Retraining Decision Tree model...")
bundle = train_and_cache_model(force_retrain=True)
print(f"Model Version: {bundle['model_version']}")
print(f"Classification Accuracy: {bundle['metrics']['classification']['accuracy']*100:.2f}% (Lift: +{bundle['metrics']['classification']['accuracy_lift']:.2f}%)")
print(f"Regression MAE: {bundle['metrics']['regression']['mae']} units")

print("\n--- TEST 1: Western Product ---")
res_w = predict_new_product_demand({
    "name": "Relaxed French Linen Shirt",
    "category": "Men",
    "subcategory": "Shirts",
    "collection": "Western",
    "price": 1899.0,
    "launch_month": 4,
    "proposed_stock": 100
})
print("Category:", res_w["category"], "Collection:", res_w["collection"])
print("Proposed Price:", res_w["proposed_price"], "Rec Price:", res_w["recommended_price"], "Cat Avg:", res_w["category_average_price"])
print("Predicted Demand:", res_w["predicted_demand"])
print("Inventory Risk:", res_w["inventory_risk"])
print("Launch Priority:", res_w["launch_priority"])

print("\n--- TEST 2: Traditional Product ---")
res_t = predict_new_product_demand({
    "name": "Zari Banarasi Bridal Lehenga",
    "category": "Women",
    "subcategory": "Ethnic Wear",
    "collection": "Traditional",
    "price": 6999.0,
    "launch_month": 10,
    "proposed_stock": 80
})
print("Category:", res_t["category"], "Collection:", res_t["collection"])
print("Festival Analysis:", res_t["festival_analysis"]["festivals"])
print("Predicted Demand:", res_t["predicted_demand"])
print("Inventory Risk:", res_t["inventory_risk"])
print("Launch Priority:", res_t["launch_priority"])

print("\n--- TEST 3: Home Essentials Product ---")
res_h = predict_new_product_demand({
    "name": "400 TC Egyptian Cotton Bedsheet Set",
    "category": "Home Essentials",
    "subcategory": "Bedsheets",
    "collection": "Home Essentials",
    "price": 1899.0,
    "launch_month": 10,
    "proposed_stock": 120
})
print("Category:", res_h["category"], "Collection:", res_h["collection"])
print("Predicted Demand:", res_h["predicted_demand"])
print("Inventory Risk:", res_h["inventory_risk"])
print("Launch Priority:", res_h["launch_priority"])
print("Flow Steps Count:", len(res_h["decision_tree_flow"]))
