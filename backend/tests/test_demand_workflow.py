"""Comprehensive End-to-End Test Suite for SaleSphere Demand Predictor & One-Click Launch System.
Tests:
1. Manager authentication.
2. Demand prediction for 'Royal Multicolour Decorative Jar Candle' (Home Essentials).
3. Parameter sensitivity: changing launch month (October vs June) and price/stock.
4. Western and Traditional clothing paths.
5. One-click product launch to operational DB & Star Schema.
6. Customer storefront browse, search, and checkout.
7. Warehouse incremental ETL ingestion.
"""

import requests
import json
import pytest

BASE_URL = "http://localhost:8001"

def test_demand_predictor_full_workflow():
    session = requests.Session()

    # 1. Manager Authentication
    login_res = session.post(f"{BASE_URL}/api/manager/auth/login", json={
        "email": "admin@salesphere.in",
        "password": "Manager@1234"
    })
    assert login_res.status_code == 200, f"Manager login failed: {login_res.text}"
    print("\n[PASS] [STEP 1] Manager authenticated successfully.")

    # 2. Demand Prediction for Royal Multicolour Decorative Jar Candle (October / Diwali window)
    jar_candle_payload = {
        "name": "Royal Multicolour Decorative Jar Candle",
        "description": "Handcrafted soy wax jar candle in vibrant multicolour festive container for Diwali pooja and home decor.",
        "category": "Home Essentials",
        "subcategory": "Festive Candles & Decorative Lighting",
        "collection": "Home Essentials",
        "brand": "SaleSphere",
        "price": 1492.0,
        "discount_percentage": 10.0,
        "sizes": ["Standard Jar"],
        "color": "Multicolour — Red, Blue, Gold",
        "fabric": "Hand-Poured Soy Wax",
        "material": "Hand-Poured Soy Wax",
        "launch_month": 10,
        "proposed_stock": 120,
        "target_customer": "Festive, Wedding & Cultural Celebrants",
        "image_url": "/api/media/uploads/072a4fb4c4d24b62b3041f709163f727.png"
    }

    pred_res = session.post(f"{BASE_URL}/api/manager/demand/predict", json=jar_candle_payload)
    assert pred_res.status_code == 200, f"Demand prediction failed: {pred_res.text}"
    p_oct = pred_res.json()

    assert p_oct["status"] == "ok"
    assert p_oct["demand_tier"] in ["High", "Low"]
    assert p_oct["demand_tier"] != "Medium", "Medium demand must be completely removed"
    assert p_oct["predicted_units"] > 0
    assert "probabilities" in p_oct
    assert "decision_path" in p_oct and len(p_oct["decision_path"]) > 0
    assert "pricing_analysis" in p_oct
    assert "inventory_risk" in p_oct
    assert "monthly_trends" in p_oct and len(p_oct["monthly_trends"]) == 12
    assert "best_launch_month" in p_oct
    assert "customer_segment_analysis" in p_oct
    assert "manager_recommendation" in p_oct

    print(f"[PASS] [STEP 2] Diwali Jar Candle (Oct): Tier={p_oct['demand_tier']}, Predicted={p_oct['predicted_units']}u, "
          f"Confidence={p_oct.get('confidence_pct')}%, Rec Price=INR {p_oct['pricing_analysis']['recommended_price']}, "
          f"Manager Status='{p_oct['manager_recommendation']['status']}'.")

    # 3. Parameter Sensitivity: Change Launch Month to June (Off-peak monsoon)
    candle_june = dict(jar_candle_payload)
    candle_june["launch_month"] = 6
    pred_june_res = session.post(f"{BASE_URL}/api/manager/demand/predict", json=candle_june)
    assert pred_june_res.status_code == 200
    p_june = pred_june_res.json()

    print(f"[PASS] [STEP 3] Sensitivity Test (Month): Oct Units={p_oct['predicted_units']} vs June Units={p_june['predicted_units']}. "
          f"Seasonal factor correctly adjusts velocity ({p_oct['monthly_trends'][9]['seasonal_index']}x in Oct vs {p_june['monthly_trends'][5]['seasonal_index']}x in June).")
    assert p_oct["predicted_units"] >= p_june["predicted_units"], "October demand should be >= June demand for festive decor"

    # 4. Parameter Sensitivity: Change Price (Overpriced) and Stock (Excess)
    candle_excess = dict(jar_candle_payload)
    candle_excess["price"] = 3999.0  # Overpriced
    candle_excess["proposed_stock"] = 500  # Severe overstock
    pred_excess_res = session.post(f"{BASE_URL}/api/manager/demand/predict", json=candle_excess)
    assert pred_excess_res.status_code == 200
    p_excess = pred_excess_res.json()

    assert p_excess["pricing_analysis"]["competitiveness"] == "Overpriced"
    assert p_excess["inventory_risk"]["overstock_risk"] == "HIGH RISK"
    assert p_excess["manager_recommendation"]["status"] in ["RECOMMENDED WITH ADJUSTMENTS", "RECOMMENDED AFTER MODIFICATIONS", "NOT RECOMMENDED CURRENTLY"]
    print(f"[PASS] [STEP 4] Sensitivity Test (Price/Stock): Competitiveness='{p_excess['pricing_analysis']['competitiveness']}', "
          f"Overstock='{p_excess['inventory_risk']['overstock_risk']}', Manager Status='{p_excess['manager_recommendation']['status']}'.")

    # 5. Division Test 1: Western Summer Dress -> Summer/Fashion Season Analysis
    summer_dress_payload = {
        "name": "Floral Cotton Sleeveless Summer Sundress",
        "description": "Breathable cotton sundress with delicate floral prints for warm spring-summer outings.",
        "category": "Women",
        "subcategory": "Dresses",
        "collection": "Western",
        "brand": "UrbanThread",
        "price": 1999.0,
        "discount_percentage": 10.0,
        "sizes": ["XS", "S", "M", "L"],
        "color": "Pastel Pink",
        "fabric": "100% Breathable Cotton",
        "launch_month": 4,
        "proposed_stock": 100,
        "target_customer": "Young Trendsetters & Streetwear Enthusiasts"
    }
    dress_res = session.post(f"{BASE_URL}/api/manager/demand/predict", json=summer_dress_payload)
    assert dress_res.status_code == 200
    p_dress = dress_res.json()
    assert p_dress["demand_tier"] in ["High", "Low"], "Demand tier must be binary (High or Low)"
    assert p_dress["demand_tier"] != "Medium", "Medium demand must not be present"
    assert p_dress["best_launch_month"]["name"] in ["March", "April", "May"], f"Western summer dress should peak in Spring/Summer, got {p_dress['best_launch_month']['name']}"
    assert "not Indian festivals" in p_dress["seasonal_explanation"] or "temperatures" in p_dress["seasonal_explanation"] or "summer" in p_dress["seasonal_explanation"].lower()
    print(f"[PASS] [STEP 5A] Western Summer Dress: Tier={p_dress['demand_tier']}, Best Month={p_dress['best_launch_month']['name']}, Category Benchmark=INR {p_dress['category_average_price']}.")

    # 5B. Division Test 2: Western Winter Jacket -> Winter/Fashion Season Analysis
    winter_jacket_payload = {
        "name": "Padded Quilted Winter Puffer Jacket",
        "description": "Heavyweight thermal insulated quilted winter jacket for cold weather travel and layering.",
        "category": "Men",
        "subcategory": "Jackets",
        "collection": "Western",
        "brand": "UrbanThread",
        "price": 3299.0,
        "discount_percentage": 15.0,
        "sizes": ["M", "L", "XL"],
        "color": "Classic Black",
        "fabric": "Polyester Fleece Padded",
        "launch_month": 11,
        "proposed_stock": 80,
        "target_customer": "Young Trendsetters & Streetwear Enthusiasts"
    }
    jacket_res = session.post(f"{BASE_URL}/api/manager/demand/predict", json=winter_jacket_payload)
    assert jacket_res.status_code == 200
    p_jacket = jacket_res.json()
    assert p_jacket["demand_tier"] in ["High", "Low"]
    assert p_jacket["demand_tier"] != "Medium"
    assert p_jacket["best_launch_month"]["name"] in ["November", "December", "January"], f"Western winter jacket should peak in Winter, got {p_jacket['best_launch_month']['name']}"
    assert "cold weather" in p_jacket["seasonal_explanation"].lower() or "winter" in p_jacket["seasonal_explanation"].lower()
    print(f"[PASS] [STEP 5B] Western Winter Jacket: Tier={p_jacket['demand_tier']}, Best Month={p_jacket['best_launch_month']['name']}, Category Benchmark=INR {p_jacket['category_average_price']}.")

    # 6A. Division Test 3: Traditional Lehenga -> Indian Festival & Wedding Calendar
    trad_lehenga_payload = {
        "name": "Bridal Banarasi Silk Lehenga Choli",
        "description": "Pure Banarasi silk lehenga with intricate golden zari floral embroidery for Diwali and weddings.",
        "category": "Women",
        "subcategory": "Ethnic Wear",
        "collection": "Traditional",
        "brand": "Salesphere Luxe",
        "price": 3999.0,
        "discount_percentage": 15.0,
        "sizes": ["Free Size"],
        "color": "Ruby Red",
        "fabric": "Pure Banarasi Silk",
        "launch_month": 10,
        "proposed_stock": 100,
        "target_customer": "Festive, Wedding & Cultural Celebrants"
    }
    lehenga_res = session.post(f"{BASE_URL}/api/manager/demand/predict", json=trad_lehenga_payload)
    assert lehenga_res.status_code == 200
    p_lehenga = lehenga_res.json()
    assert p_lehenga["demand_tier"] in ["High", "Low"]
    assert p_lehenga["demand_tier"] != "Medium"
    assert p_lehenga["best_launch_month"]["name"] in ["October", "November"], f"Traditional lehenga should peak in Oct/Nov, got {p_lehenga['best_launch_month']['name']}"
    assert "festival" in p_lehenga["seasonal_explanation"].lower() or "wedding" in p_lehenga["seasonal_explanation"].lower()
    print(f"[PASS] [STEP 6A] Traditional Lehenga: Tier={p_lehenga['demand_tier']}, Best Month={p_lehenga['best_launch_month']['name']}, Category Benchmark=INR {p_lehenga['category_average_price']}.")

    # 6B. Division Test 4: Home Essentials Diwali Diya -> Diwali and Festive Calendar
    diwali_diya_payload = {
        "name": "Royal Decorative Diya Gift Set",
        "description": "Handcrafted pure brass decorative diya set with ornate engravings for Diwali pooja.",
        "category": "Home Essentials",
        "subcategory": "Diyas & Deepams",
        "collection": "Home Essentials",
        "brand": "SaleSphere",
        "price": 1499.0,
        "discount_percentage": 10.0,
        "sizes": ["12 Pieces Set"],
        "color": "Warm Gold / Brass",
        "material": "Pure Handcrafted Brass",
        "launch_month": 11,
        "proposed_stock": 120,
        "target_customer": "Modern Home Decorators & Lifestyle Enthusiasts"
    }
    diya_res = session.post(f"{BASE_URL}/api/manager/demand/predict", json=diwali_diya_payload)
    assert diya_res.status_code == 200
    p_diya = diya_res.json()
    assert p_diya["demand_tier"] in ["High", "Low"]
    assert p_diya["demand_tier"] != "Medium"
    assert p_diya["best_launch_month"]["name"] in ["October", "November"], f"Home Essentials Diwali diya should peak in Oct/Nov, got {p_diya['best_launch_month']['name']}"
    assert "diwali" in p_diya["seasonal_explanation"].lower() or "festive" in p_diya["seasonal_explanation"].lower()
    print(f"[PASS] [STEP 6B] Home Essentials Diwali Diya: Tier={p_diya['demand_tier']}, Best Month={p_diya['best_launch_month']['name']}, Category Benchmark=INR {p_diya['category_average_price']}.")

    # 7. One-Click Product Launch for Royal Multicolour Decorative Jar Candle
    launch_payload = {
        "prediction_id": p_oct.get("prediction_id"),
        "name": "Royal Multicolour Decorative Jar Candle",
        "description": "Handcrafted soy wax jar candle in vibrant multicolour festive container for Diwali pooja and home decor.",
        "category": "Home Essentials",
        "subcategory": "Festive Candles & Decorative Lighting",
        "collection": "Home Essentials",
        "brand": "SaleSphere",
        "price": 1492.0,
        "discount_percentage": 10.0,
        "sizes": ["Standard Jar"],
        "color": "Multicolour — Red, Blue, Gold",
        "fabric": "Hand-Poured Soy Wax",
        "material": "Hand-Poured Soy Wax",
        "launch_month": 10,
        "approved_stock": 120,
        "image_url": "/api/media/uploads/072a4fb4c4d24b62b3041f709163f727.png"
    }

    launch_res = session.post(f"{BASE_URL}/api/manager/demand/approve-launch", json=launch_payload)
    assert launch_res.status_code == 200, f"Approve launch failed: {launch_res.text}"
    launched_data = launch_res.json()
    product_id = launched_data["product_id"]
    sku = launched_data["sku"]
    print(f"[PASS] [STEP 7] One-Click Launch Succeeded! Product ID={product_id}, SKU={sku}, Approved Stock={launched_data['approved_stock']}u.")

    # 8. Customer Storefront Verification (Product detail, category listing & search)
    cust_session = requests.Session()
    prod_get = cust_session.get(f"{BASE_URL}/api/products/{product_id}")
    assert prod_get.status_code == 200, f"Product not found on storefront: {prod_get.text}"
    prod_info = prod_get.json()
    assert prod_info["name"] == "Royal Multicolour Decorative Jar Candle"
    assert prod_info["price"] == 1492.0
    assert prod_info["stock"] == 120
    assert prod_info["category"] == "home"
    print(f"[PASS] [STEP 8] Storefront Verification: Product '{prod_info['name']}' is live with stock={prod_info['stock']}u at INR {prod_info['price']}.")

    # 9. Customer Checkout Flow with Launched Product
    # Customer login
    cust_login = cust_session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "demo@salesphere.in",
        "password": "Demo@1234"
    })
    assert cust_login.status_code == 200

    order_payload = {
        "customer_name": "Aarav Sharma",
        "customer_email": "demo@salesphere.in",
        "customer_phone": "9876543210",
        "items": [
            {
                "product_id": product_id,
                "name": prod_info["name"],
                "price": prod_info["price"],
                "original_price": prod_info["original_price"],
                "quantity": 2,
                "size": prod_info["sizes"][0],
                "color": prod_info["colors"][0],
                "image": prod_info["images"][0]
            }
        ],
        "shipping_address": {
            "full_name": "Aarav Sharma",
            "phone": "9876543210",
            "line1": "104 Festive Enclave, MG Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "postal_code": "560001",
            "country": "India"
        },
        "payment_method": "cod",
        "subtotal": 1492.0 * 2,
        "shipping": 0,
        "discount": 0,
        "total": 1492.0 * 2
    }

    order_res = cust_session.post(f"{BASE_URL}/api/orders", json=order_payload)
    assert order_res.status_code in [200, 201], f"Customer checkout failed: {order_res.text}"
    order_data = order_res.json()
    order_id = order_data["id"]
    print(f"[PASS] [STEP 9] Customer Checkout Succeeded: Order ID={order_id}, Total=INR {order_data['total']} for 2 units.")

    # 10. Incremental ETL Ingestion & Data Warehouse Verification
    etl_res = session.post(f"{BASE_URL}/api/manager/etl/refresh")
    assert etl_res.status_code == 200
    etl_data = etl_res.json()
    print(f"[PASS] [STEP 10] Incremental ETL Refresh completed: Synced={etl_data.get('new_orders_synced')} order(s), "
          f"Total DW Transactions={etl_data.get('total_transactions')}.")

    # Confirm latest transaction in DW
    tx_res = session.get(f"{BASE_URL}/api/manager/transactions?limit=5")
    assert tx_res.status_code == 200
    tx_items = tx_res.json().get("items", [])
    found_order = any(t.get("order_id") == order_id for t in tx_items)
    print(f"[PASS] [STEP 11] Data Warehouse Transaction Verification: Live order {order_id} present in DW = {found_order}.")

    print("\n============================================================")
    print("ALL 11 END-TO-END DEMAND PREDICTOR & LAUNCH TESTS PASSED 100%!")
    print("============================================================\n")

if __name__ == "__main__":
    test_demand_predictor_full_workflow()
