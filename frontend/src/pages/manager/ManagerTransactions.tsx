import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Filter, Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTitle } from "@/pages/manager/ManagerOverview";

interface TransactionRow {
  transaction_id: number;
  order_item_id: string;
  order_id: string;
  customer_id: number;
  product_id: number;
  product_name: string;
  product_category: string;
  brand: string;
  quantity: number;
  unit_price: number;
  gross_amount: number;
  discount_percentage: number;
  discount_amount: number;
  net_sales: number;
  order_date: string;
  payment_method: string;
  purchase_channel: string;
  return_status: string;
  return_reason: string | null;
  refund_amount: number;
  product_rating: number;
  data_source: string;
  created_at: string;
  city?: string | null;
}

interface TransactionTableResponse {
  items: TransactionRow[];
  total: number;
  page: number;
  pages: number;
  summary: {
    displayed_items: number;
    total_records: number;
    page: number;
    pages: number;
    authoritative_dataset: string;
  };
}

export default function ManagerTransactions() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [returnStatus, setReturnStatus] = useState("");
  const [dataSource, setDataSource] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"DESC" | "ASC">("DESC");

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: "25",
    sort_order: sortOrder,
    ...(q.trim() ? { q: q.trim() } : {}),
    ...(category ? { category } : {}),
    ...(returnStatus ? { return_status: returnStatus } : {}),
    ...(dataSource ? { data_source: dataSource } : {}),
  }).toString();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["manager", "transactions", queryParams],
    queryFn: () => apiGet<TransactionTableResponse>(`/manager/transactions?${queryParams}`),
    placeholderData: (prev) => prev,
  });

  const handleExportCsv = () => {
    toast.info("Preparing CSV export of complete transaction history...");
    window.open("/api/manager/etl/export-csv", "_blank");
  };

  const getStatusBadge = (status: string) => {
    if (status === "Not Returned") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#15803D]/10 text-[#15803D]">Not Returned</span>;
    }
    if (status === "Returned") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">Returned</span>;
    }
    if (status === "Exchanged") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Exchanged</span>;
    }
    return <span className="text-xs text-muted-foreground">{status}</span>;
  };

  const getSourceBadge = (source: string) => {
    if (source === "Live Storefront") {
      return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Live Storefront</span>;
    }
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-200 text-neutral-800">{source}</span>;
  };

  return (
    <div data-testid="manager-transactions-page" className="space-y-6">
      <PageTitle overline="Data Warehouse Fact Records" title="Transactions & Dataset">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-1.5 bg-card text-xs font-medium"
            onClick={handleExportCsv}
            data-testid="export-csv-button"
          >
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </PageTitle>

      {/* Authoritative Dataset Alert */}
      <div className="border border-border bg-card p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-semibold text-foreground">Authoritative Dataset:</span>{" "}
          <span className="font-mono text-muted-foreground">salesphere_unified_dataset_v2.csv</span> (48,500+ fact records)
          <span className="ml-2 text-muted-foreground">• Live customer purchases are appended incrementally to fact_transactions.</span>
        </div>
        <div className="font-mono text-xs font-medium text-foreground">
          Total Records: {data?.total?.toLocaleString() ?? "48,500+"}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 border border-border">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search Order ID, Customer ID, Category, Brand..."
            className="pl-9 bg-background h-9 text-xs"
            data-testid="transactions-search-input"
          />
        </div>

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="h-9 px-3 text-xs bg-background border border-input rounded-md"
        >
          <option value="">All Categories</option>
          <option value="Women">Women</option>
          <option value="Men">Men</option>
          <option value="Kids">Kids</option>
          <option value="Home Essentials">Home Essentials</option>
        </select>

        <select
          value={returnStatus}
          onChange={(e) => { setReturnStatus(e.target.value); setPage(1); }}
          className="h-9 px-3 text-xs bg-background border border-input rounded-md"
        >
          <option value="">All Return Statuses</option>
          <option value="Not Returned">Not Returned</option>
          <option value="Returned">Returned</option>
          <option value="Exchanged">Exchanged</option>
        </select>

        <select
          value={dataSource}
          onChange={(e) => { setDataSource(e.target.value); setPage(1); }}
          className="h-9 px-3 text-xs bg-background border border-input rounded-md"
        >
          <option value="">All Sources</option>
          <option value="Live Storefront">Live Storefront</option>
          <option value="Real">Real (Dataset v2)</option>
          <option value="Synthetic">Synthetic (Dataset v2)</option>
        </select>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 px-2.5 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => setSortOrder(prev => prev === "DESC" ? "ASC" : "DESC")}
        >
          <ArrowUpDown size={13} /> {sortOrder === "DESC" ? "Newest First" : "Oldest First"}
        </Button>
      </div>

      {/* Transactions Data Table */}
      <div className="border border-border bg-card overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs whitespace-nowrap" data-testid="transactions-table">
          <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-4 py-3">Item ID</th>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Category / Brand</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Unit Price</th>
              <th className="px-4 py-3 text-right">Gross</th>
              <th className="px-4 py-3 text-right">Discount</th>
              <th className="px-4 py-3 text-right font-bold">Net Sales</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Return Status</th>
              <th className="px-4 py-3 text-right">Refund</th>
              <th className="px-4 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono text-[11px]">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={15} className="p-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : data && data.items.length > 0 ? (
              data.items.map((row) => (
                <tr key={row.transaction_id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 text-muted-foreground">{row.order_item_id}</td>
                  <td className="px-4 py-2.5 font-semibold text-foreground">{row.order_id}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-sans font-medium text-foreground">C-{row.customer_id}</span>
                    {row.city && <span className="block text-[10px] text-muted-foreground font-sans">{row.city}</span>}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{row.order_date}</td>
                  <td className="px-4 py-2.5 font-sans">
                    <span className="font-medium text-foreground">{row.product_category}</span>
                    <span className="text-muted-foreground text-[10px] block">{row.brand}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">{row.quantity}</td>
                  <td className="px-4 py-2.5 text-right">{formatINR(row.unit_price)}</td>
                  <td className="px-4 py-2.5 text-right">{formatINR(row.gross_amount)}</td>
                  <td className="px-4 py-2.5 text-right text-muted-foreground">
                    {row.discount_amount > 0 ? `-${formatINR(row.discount_amount)}` : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-foreground">
                    {formatINR(row.net_sales)}
                  </td>
                  <td className="px-4 py-2.5 font-sans text-muted-foreground">{row.payment_method}</td>
                  <td className="px-4 py-2.5 font-sans text-muted-foreground">{row.purchase_channel}</td>
                  <td className="px-4 py-2.5 font-sans">{getStatusBadge(row.return_status)}</td>
                  <td className="px-4 py-2.5 text-right text-red-600">
                    {row.refund_amount > 0 ? `-${formatINR(row.refund_amount)}` : "—"}
                  </td>
                  <td className="px-4 py-2.5 font-sans">{getSourceBadge(row.data_source)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={15} className="p-8 text-center text-sm font-sans text-muted-foreground">
                  No transactions found matching your search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans text-muted-foreground">
        <div>
          Showing page <span className="font-semibold text-foreground">{data?.page ?? 1}</span> of{" "}
          <span className="font-semibold text-foreground">{data?.pages ?? 1}</span> (
          {(data?.total ?? 0).toLocaleString()} total records)
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-8 px-2.5 text-xs bg-card"
          >
            <ChevronLeft size={14} /> Previous
          </Button>
          <span className="px-2 font-mono text-xs text-foreground">{page}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!data || page >= data.pages || isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="h-8 px-2.5 text-xs bg-card"
          >
            Next <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
