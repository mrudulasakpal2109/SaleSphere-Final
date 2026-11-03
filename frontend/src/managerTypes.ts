// Hand-written mirrors of backend/models/manager.py and the SSE event shapes.
import type { Order } from "@/types";

export type ManagerRole = "admin" | "manager";

export interface Manager {
  id: string;
  name: string;
  email: string;
  role: ManagerRole;
  created_at: string;
}

export interface ManagerCreateInput {
  name: string;
  email: string;
  password: string;
  role: ManagerRole;
}

export interface Kpis {
  registered_customers: number;
  total_orders: number;
  open_orders: number;
  cancelled_orders: number;
  completed_sales: number;
  paid_revenue: number;
  pending_cod_value: number;
  avg_order_value: number;
  active_products: number;
  units_in_stock: number;
  low_stock_products: number;
  out_of_stock_products: number;
}

export interface TrendPoint {
  date: string;
  orders: number;
  order_value: number;
  paid_revenue: number;
}

export interface LabelCount {
  label: string;
  count: number;
}

export interface ProductPerformance {
  product_id: string;
  name: string;
  sku: string;
  units: number;
  order_value: number;
}

export interface CategorySales {
  category: string;
  units: number;
  order_value: number;
}

export interface RecentOrder {
  id: string;
  customer_name: string;
  is_guest: boolean;
  total: number;
  status: string;
  payment_status: string;
  placed_at: string;
}

export interface LiveSalesChartPoint {
  label: string;
  interval_start: string;
  orders: number;
  revenue: number;
  items: number;
}

export interface LiveTransactionItem {
  id: string;
  customer_name: string;
  customer_email: string;
  is_guest: boolean;
  items_count: number;
  items_summary: string;
  total: number;
  subtotal: number;
  discount_total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  placed_at: string;
  synced_to_dw: boolean;
}

export interface WarehouseSyncStatus {
  last_sync_timestamp: string | null;
  unsynced_live_orders: number;
  synced_live_orders: number;
  total_warehouse_records: number;
  total_warehouse_revenue: number;
  data_source_operational: string;
  data_source_warehouse: string;
}

export interface LiveSalesMetrics {
  orders_count: number;
  total_orders_placed: number;
  cancelled_orders: number;
  revenue: number;
  avg_order_value: number;
  items_sold: number;
  unsynced_orders: number;
}

export interface LiveSalesOverview {
  period: string;
  period_label: string;
  start_date: string;
  end_date: string;
  as_of: string;
  metrics: LiveSalesMetrics;
  chart: LiveSalesChartPoint[];
  chart_interval: "hourly" | "daily";
  transactions: LiveTransactionItem[];
  warehouse_status: WarehouseSyncStatus;
}

export interface Overview {
  as_of: string;
  kpis: Kpis;
  trend: TrendPoint[];
  order_status: LabelCount[];
  payment_status: LabelCount[];
  top_products: ProductPerformance[];
  category_sales: CategorySales[];
  recent_orders: RecentOrder[];
  live_sales?: LiveSalesOverview;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  stock: number;
  stock_status: "in_stock" | "low" | "out";
  units_ordered: number;
}

export interface CustomerRow {
  key: string;
  name: string;
  email: string;
  is_guest: boolean;
  registered_at: string | null;
  orders: number;
  completed_purchases: number;
  paid_spend: number;
  order_value: number;
  last_order_at: string | null;
}

export interface CustomerListResponse {
  items: CustomerRow[];
  total: number;
}

export interface CustomerDetail {
  customer: CustomerRow;
  orders: Order[];
}

export interface RfmCustomer {
  key: string;
  name: string;
  email: string;
  recency_days: number;
  frequency: number;
  monetary: number;
  r_score: number;
  f_score: number;
  m_score: number;
  rfm_score: string;
  segment: string | null;
  kmeans_cluster: number | null;
  hierarchical_cluster: number | null;
}

export interface ClusterSummary {
  cluster: number;
  label: string;
  size: number;
  percentage?: number;
  avg_recency: number;
  avg_frequency: number;
  avg_monetary: number;
  median_recency?: number;
  median_frequency?: number;
  median_monetary?: number;
  centroid_recency_scaled?: number;
  centroid_frequency_scaled?: number;
  centroid_monetary_scaled?: number;
  pca1?: number;
  pca2?: number;
  tagline?: string;
  recommended_actions?: string[];
  color?: string;
}

export interface Dendrogram {
  icoord: number[][];
  dcoord: number[][];
  labels: string[];
}

export interface KMeansEvaluationPoint {
  k: number;
  inertia: number;
  silhouette_score: number;
}

export interface RfmResponse {
  status: "ok" | "insufficient_data";
  message: string;
  as_of: string;
  rules: string[];
  min_customers: number;
  eligible_customers: number;
  completed_orders: number;
  excluded_orders: number;
  customers: RfmCustomer[];
  kmeans: ClusterSummary[];
  hierarchical: ClusterSummary[];
  silhouette: number | null;
  dendrogram: Dendrogram | null;
  evaluations?: KMeansEvaluationPoint[];
  optimal_k_explanation?: string;
  centroids?: Record<string, any>[];
  k_selected?: number;
}

// ----------------- Warehouse Explorer & ETL Audit Types -----------------
export interface TableColumnMeta {
  name: string;
  type: string;
  nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  references: string | null;
  description?: string;
}

export interface WarehouseTableSchema {
  table_name: string;
  display_name: string;
  table_type: "fact" | "dimension" | "analytics" | "audit";
  row_count: number;
  column_count: number;
  description: string;
  primary_key: string[];
  foreign_keys: { from_column: string; to_table: string; to_column: string }[];
  columns: TableColumnMeta[];
}

export interface WarehouseSchemaResponse {
  database: string;
  tables: WarehouseTableSchema[];
  total_records: number;
  star_schema_role: Record<string, string>;
}

export interface TableDataResponse {
  table_name: string;
  total_rows: number;
  page: number;
  limit: number;
  columns: string[];
  rows: Record<string, any>[];
}

export interface DatabaseComparisonFeature {
  dimension: string;
  oltp_operational: string;
  olap_warehouse: string;
  salesphere_implementation: string;
}

export interface DatabaseComparisonResponse {
  title: string;
  summary: string;
  oltp_name: string;
  oltp_db: string;
  olap_name: string;
  olap_db: string;
  features: DatabaseComparisonFeature[];
}

export interface EtlAuditRecord {
  run_id: string;
  timestamp: string;
  trigger_type: string;
  status: string;
  duration_ms: number;
  records_examined: number;
  eligible_orders: number;
  inserted_rows: number;
  skipped_duplicates: number;
  rejected_rows: number;
  silhouette_score?: number | null;
  step_timings: Record<string, number>;
  notes?: string | null;
}

export interface EtlAuditHistoryResponse {
  runs: EtlAuditRecord[];
  total_runs: number;
}

export interface DataQualityCheck {
  id: string;
  name: string;
  category: "referential_integrity" | "uniqueness" | "completeness" | "business_logic" | "temporal_consistency";
  table: string;
  description: string;
  status: "PASS" | "FAIL" | "WARNING";
  total_records_checked: number;
  violations_count: number;
  details: string;
  sql_query: string;
}

export interface DataQualityResponse {
  timestamp: string;
  overall_status: "PASS" | "FAIL" | "WARNING";
  checks_passed: number;
  checks_total: number;
  checks: DataQualityCheck[];
}

export interface TransformationPreviewItem {
  operational_order_id: string;
  customer_id: string;
  source_fields: Record<string, any>;
  transformed_dw_row: Record<string, any>;
  validation_status: string;
  rules_applied: string[];
}

export interface TransformationPreviewResponse {
  description: string;
  rules_explained: { rule_id: string; name: string; description: string }[];
  sample_items: TransformationPreviewItem[];
}

export interface DataLineageNode {
  id: string;
  label: string;
  stage: string;
  type: "source" | "table" | "process" | "storage" | "analytics";
  description: string;
}

export interface DataLineageEdge {
  source: string;
  target: string;
  label: string;
  transformation?: string;
}

export interface DataLineageResponse {
  nodes: DataLineageNode[];
  edges: DataLineageEdge[];
  pipeline_stages: { stage: string; description: string }[];
}

export interface EtlStatusResponse {
  status: string;
  message: string;
  timestamp: string;
  new_orders_synced: number;
  total_transactions: number;
  total_customers: number;
  silhouette_score: number;
  paid_revenue: number;
  authoritative_source: string;
  run_id?: string;
  duration_ms?: number;
}

// SSE events from /api/assistant/chat and /api/manager/insights.
export type StreamEvent =
  | { type: "start"; conversation_id: string }
  | { type: "delta"; text: string }
  | { type: "error"; message: string }
  | { type: "done"; conversation_id?: string };

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConversationOut {
  conversation_id: string;
  messages: ChatMessage[];
}

// ----------------- Decision Tree Demand Predictor Types -----------------
export interface TreeNode {
  id: number;
  depth: number;
  is_leaf: boolean;
  feature?: string;
  threshold?: number;
  condition?: string;
  samples: number;
  impurity: number;
  distribution: Record<string, number>;
  prediction?: string;
  description?: string;
  left?: TreeNode;
  right?: TreeNode;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ConfusionMatrixData {
  labels: string[];
  matrix: number[][];
}

export interface ModelMetrics {
  classification: {
    accuracy: number;
    baseline_accuracy: number;
    accuracy_lift: number;
    precision: number;
    recall: number;
    f1_score: number;
    confusion_matrix: ConfusionMatrixData;
  };
  regression: {
    mae: number;
    baseline_mae: number;
    rmse: number;
    baseline_rmse: number;
    r2_score: number;
  };
}

export interface VivaExplanation {
  data_mining: string;
  model_training: string;
  prediction: string;
  inventory_decision: string;
  data_warehousing: string;
  business_value: string;
  why_decision_tree: string;
  limitations: string;
}

export interface DemandModelInfo {
  status: string;
  model_version: string;
  trained_at: string;
  training_samples: number;
  test_samples: number;
  total_historical_records: number;
  features: string[];
  class_labels: string[];
  metrics: ModelMetrics;
  feature_importances: FeatureImportance[];
  tree_graph: TreeNode;
  viva_explanation: VivaExplanation;
}

export interface DecisionPathRule {
  node_id: number;
  feature: string;
  threshold: number;
  actual_value: number;
  branch_taken: string;
  explanation: string;
}

export interface InventoryGap {
  proposed_stock: number;
  predicted_demand: number;
  difference: number;
  risk_type: "shortage_risk" | "excess_risk" | "balanced";
  message: string;
}

export interface DemandRecommendation {
  status_label: string;
  badge_variant: "high" | "medium" | "low";
  advice: string;
}

export interface DemandPredictionResult {
  status: string;
  product_name: string;
  category: string;
  subcategory: string;
  collection?: string;
  brand: string;
  image_url?: string;
  price?: number;
  proposed_price?: number;
  recommended_price?: number;
  category_average_price?: number;
  price_explanation?: string;
  pricing_analysis?: {
    proposed_price: number;
    category_benchmark: number;
    recommended_price: number;
    recommended_discount: number;
    competitiveness: string;
    price_diff_pct: number;
    explanation: string;
  };
  product_details?: {
    fabric_or_material?: string;
    occasion_or_room?: string;
    sleeve_type?: string;
    pattern?: string;
    dimensions?: string;
  };
  best_performing_categories?: { name: string; units_sold: number }[];
  popular_colors?: { color: string; share: string; sentiment: string }[];
  discount_percentage?: number;
  launch_month: number;
  launch_month_name?: string;
  season: string;
  festival_analysis?: {
    festivals: string[];
    seasonal_context: string;
    description: string;
    multiplier: number;
  };
  proposed_stock: number;
  predicted_units: number;
  prediction_period?: string;
  demand_tier: "High" | "Medium" | "Low" | string;
  probabilities: Record<string, number>;
  confidence_pct?: number;
  demand_explanation?: string;
  probability_explanation?: string;
  suggested_initial_stock: number;
  feature_importances?: {
    feature: string;
    label: string;
    importance: number;
  }[];
  inventory_risk?: {
    level: string;
    badge: string;
    reasoning: string;
    overstock_risk?: string;
    stockout_risk?: string;
    holding_risk?: string;
    proposed_stock?: number;
    estimated_demand?: number;
    recommended_stock?: number;
    suggested_adjustment?: string;
    suggested_adjustment_units?: number;
  };
  stock_evaluation?: {
    proposed_stock: number;
    recommended_stock: number;
    difference: number;
    explanation: string;
  };
  monthly_trends?: {
    month: number;
    month_name: string;
    full_month_name: string;
    historical_units: number;
    seasonal_index: number;
    projected_units: number;
    festivals: string[];
    is_recommended: boolean;
    is_selected: boolean;
  }[];
  best_launch_month?: {
    month: number;
    name: string;
    projected_units: number;
    seasonal_index: number;
    reason: string;
  };
  second_best_launch_month?: {
    month: number;
    name: string;
    projected_units: number;
    seasonal_index: number;
    reason: string;
  };
  lowest_demand_period?: {
    period: string;
    reason: string;
  };
  seasonal_explanation?: string;
  customer_segment_analysis?: {
    selected_segment: string;
    rfm_cluster: string;
    historical_aov: number;
    purchase_frequency: string;
    top_categories: string[];
    fit_reasoning: string;
  };
  manager_recommendation?: {
    status: string;
    badge_color: string;
    recommended_price: number;
    recommended_discount: number;
    recommended_launch_month: string;
    recommended_launch_month_num: number;
    recommended_initial_stock: number;
    main_risks: string[];
    suggested_customer_segment: string;
    rationale: string;
  };
  launch_priority?: {
    priority: string;
    badge: string;
    reasoning: string;
  };
  decision_tree_flow?: {
    step: number;
    title: string;
    value: string;
    detail: string;
  }[];
  inventory_gap?: InventoryGap;
  recommendation?: DemandRecommendation;
  decision_path: DecisionPathRule[];
  prediction_id?: string;
}

export interface DemandPredictionHistoryItem {
  id: string;
  product_name: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  discount_percentage: number;
  launch_month: number;
  season: string;
  sizes: string[];
  color: string;
  fabric: string;
  image_url: string;
  proposed_stock: number;
  predicted_units: number;
  demand_tier: "High" | "Medium" | "Low";
  probabilities: Record<string, number>;
  suggested_stock: number;
  status: "Draft" | "Approved" | "Rejected";
  approved_stock: number | null;
  created_product_id: string | null;
  manager_email: string;
  created_at: string;
}

