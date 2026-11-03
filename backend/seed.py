"""Seeds the operational SQLite database with catalog products (216 items across Men, Women, Kids, Home Essentials),
the demo customer (demo@salesphere.in / Demo@1234), and the admin manager (admin@salesphere.in / Manager@1234).
Strict segregation between Men, Women, Kids, and Home Essentials collections with verified high-end photography.
"""

import sys
import os
import uuid
import json
from pathlib import Path
from datetime import datetime, timedelta, timezone

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.lib.db import get_op_conn, init_op_db
from backend.lib.security import hash_password
from backend.lib.dates import utcnow
from backend.catalog_data import get_all_catalog_products

def seed_database():
    init_op_db()
    conn = get_op_conn()
    cur = conn.cursor()

    # 1. Seed Admin Manager
    mgr_email = "admin@salesphere.in"
    if not cur.execute("SELECT id FROM op_managers WHERE LOWER(email) = LOWER(?);", (mgr_email,)).fetchone():
        mgr_id = str(uuid.uuid4())
        pwd_hash = hash_password("Manager@1234")
        now_str = utcnow().isoformat()
        cur.execute("""
        INSERT INTO op_managers (id, name, email, role, password_hash, created_at)
        VALUES (?, ?, ?, 'admin', ?, ?);
        """, (mgr_id, "Store Admin", mgr_email, pwd_hash, now_str))
        print("Seeded admin manager: admin@salesphere.in / Manager@1234")

    # 2. Seed Demo Customer
    demo_email = "demo@salesphere.in"
    demo_user = cur.execute("SELECT id FROM op_users WHERE LOWER(email) = LOWER(?);", (demo_email,)).fetchone()
    if not demo_user:
        cust_id = str(uuid.uuid4())
        pwd_hash = hash_password("Demo@1234")
        now_str = (utcnow() - timedelta(days=30)).isoformat()
        cur.execute("""
        INSERT INTO op_users (id, name, email, phone, password_hash, created_at)
        VALUES (?, ?, ?, '9876543210', ?, ?);
        """, (cust_id, "Aarav Sharma", demo_email, pwd_hash, now_str))

        # Seed address
        addr_id = str(uuid.uuid4())
        cur.execute("""
        INSERT INTO op_addresses (id, user_id, label, full_name, phone, line1, line2, city, state, postal_code, is_default, created_at)
        VALUES (?, ?, 'Home', 'Aarav Sharma', '9876543210', '221, Residency Road', 'Ashok Nagar', 'Bengaluru', 'Karnataka', '560025', 1, ?);
        """, (addr_id, cust_id, now_str))
        print("Seeded demo customer: demo@salesphere.in / Demo@1234")
        demo_user_id = cust_id
    else:
        demo_user_id = demo_user[0]

    # Also ensure aarav.sharma@example.com exists
    alt_email = "aarav.sharma@example.com"
    alt_user = cur.execute("SELECT id FROM op_users WHERE LOWER(email) = LOWER(?);", (alt_email,)).fetchone()
    if not alt_user:
        alt_id = str(uuid.uuid4())
        alt_pwd = hash_password("Password@123")
        now_str = (utcnow() - timedelta(days=30)).isoformat()
        cur.execute("""
        INSERT INTO op_users (id, name, email, phone, password_hash, created_at)
        VALUES (?, 'Aarav Sharma', ?, '9876543210', ?, ?);
        """, (alt_id, alt_email, alt_pwd, now_str))
        cur.execute("""
        INSERT INTO op_addresses (id, user_id, label, full_name, phone, line1, line2, city, state, postal_code, is_default, created_at)
        VALUES (?, ?, 'Home', 'Aarav Sharma', '9876543210', '221, Residency Road', 'Ashok Nagar', 'Bengaluru', 'Karnataka', '560025', 1, ?);
        """, (str(uuid.uuid4()), alt_id, now_str))
        print("Seeded customer: aarav.sharma@example.com / Password@123")

    # 3. Clean and Seed Catalog Products
    cur.execute("DELETE FROM op_products;")

    catalog_items = get_all_catalog_products()
    inserted_prods = 0
    now_dt = utcnow()

    for idx, p in enumerate(catalog_items):
        prod_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, p["sku"]))
        images = [p["image"]]
        color_images = {c: p["image"] for c in p["colors"]}

        created_str = (now_dt - timedelta(days=idx)).isoformat()
        cur.execute("""
        INSERT INTO op_products 
        (id, sku, name, description, category, subcategory, price, original_price,
         sizes_json, colors_json, stock, images_json, color_images_json, rating,
         rating_count, tags_json, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?);
        """, (
            prod_id, p["sku"], p["name"], p["description"], p["category"], p["subcategory"],
            float(p["price"]), float(p["original_price"]) if p["original_price"] else None,
            json.dumps(p["sizes"]), json.dumps(p["colors"]), 100, json.dumps(images),
            json.dumps(color_images), float(p["rating"]), int(p["rating_count"]),
            json.dumps(p["tags"]), created_str, created_str
        ))
        inserted_prods += 1

    # 4. Seed Demo Order if no orders exist
    if not cur.execute("SELECT id FROM op_orders;").fetchone():
        order_id = "SP-DEMO-001"
        order_items = [{
            "product_id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "SP-M001")),
            "name": "Essential Crew-Neck Cotton T-Shirt",
            "sku": "SP-M001",
            "image": catalog_items[0]["image"],
            "size": "L",
            "color": "Black",
            "unit_price": 599.0,
            "original_price": 999.0,
            "quantity": 2,
            "line_total": 1198.0
        }]
        shipping = {
            "label": "Home",
            "full_name": "Aarav Sharma",
            "phone": "9876543210",
            "line1": "221, Residency Road",
            "line2": "Ashok Nagar",
            "city": "Bengaluru",
            "state": "Karnataka",
            "postal_code": "560025",
            "is_default": True
        }
        order_time = (now_dt - timedelta(days=2)).isoformat()
        cur.execute("""
        INSERT INTO op_orders (
            id, customer_id, customer_name, customer_email, customer_phone,
            items_json, shipping_address_json, subtotal, discount_total, delivery_charge,
            total, payment_method, payment_status, status, placed_at, updated_at, synced_to_dw
        ) VALUES (?, ?, 'Aarav Sharma', 'demo@salesphere.in', '9876543210', ?, ?, 1198.0, 800.0, 99.0, 1297.0, 'COD', 'Pending', 'Placed', ?, ?, 0);
        """, (order_id, demo_user_id, json.dumps(order_items), json.dumps(shipping), order_time, order_time))
        print("Seeded demo order: SP-DEMO-001")

    conn.commit()
    conn.close()
    print(f"Operational DB successfully seeded with {inserted_prods} products across Men, Women, Kids, and Home Essentials.")

if __name__ == "__main__":
    seed_database()
