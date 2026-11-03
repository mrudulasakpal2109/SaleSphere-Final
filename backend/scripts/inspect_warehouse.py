import sqlite3

conn = sqlite3.connect('database/ecommerce_dw.db')
cur = conn.cursor()
tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
print("--- DW Tables & Counts ---")
for t in tables:
    cnt = cur.execute(f"SELECT COUNT(*) FROM {t};").fetchone()[0]
    print(f"{t}: {cnt} rows")

print("\n--- Category Breakdown in fact_transactions ---")
cur.execute("SELECT product_category, COUNT(*), ROUND(SUM(net_sales), 2) FROM fact_transactions GROUP BY product_category;")
for cat, count, sales in cur.fetchall():
    print(f"{cat}: {count} transactions, Total Net Sales: Rs. {sales:,.2f}")
conn.close()

