import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.pipeline import run_analysis_pipeline
import sqlite3

res = run_analysis_pipeline(n_clusters_kmeans=4, n_clusters_hierarchical=4, force_reseed=False)
print("Pipeline run successfully!")
print("K-Means Clusters:", len(res["kmeans"]))
print("Silhouette Score:", res["silhouette"])
for c in res["kmeans"]:
    print(f"  Cluster {c['cluster']} ({c['label']}): {c['size']} customers, Avg Recency: {c['avg_recency']}d, Avg Freq: {c['avg_frequency']}, Avg Monetary: Rs. {c['avg_monetary']:,.2f}")

conn = sqlite3.connect('database/ecommerce_dw.db')
cur = conn.cursor()
print("customer_rfm rows:", cur.execute("SELECT COUNT(*) FROM customer_rfm;").fetchone()[0])
print("cluster_results rows:", cur.execute("SELECT COUNT(*) FROM cluster_results;").fetchone()[0])
conn.close()
