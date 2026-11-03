import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PackageSearch, SlidersHorizontal } from "lucide-react";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EmptyState } from "@/components/EmptyState";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterPanel, EMPTY_FILTERS, type FilterState } from "@/components/shop/FilterPanel";
import { SUBCATEGORIES, SORT_OPTIONS, PAGE_SIZE, productsQueryString } from "@/lib/catalog";
import type { ProductListResponse } from "@/types";

export type ShopMode =
  | { kind: "category"; category: "men" | "women" | "kids" | "home" }
  | { kind: "tag"; tag: string }
  | { kind: "sale" }
  | { kind: "search" };

const CATEGORY_META: Record<string, { overline: string; title: string }> = {
  men: { overline: "For Him", title: "Men" },
  women: { overline: "For Her", title: "Women" },
  kids: { overline: "For Little Ones", title: "Kids" },
  home: { overline: "For Your Living Space", title: "Home Essentials" },
};

export default function Shop({ mode }: { mode: ShopMode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? defaultSort(mode);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const filters: FilterState = useMemo(
    () => ({
      subcategory: (searchParams.get("subcategory") ?? "").split(",").filter(Boolean),
      min_price: parseNum(searchParams.get("min_price")),
      max_price: parseNum(searchParams.get("max_price")),
      size: searchParams.get("size") ?? undefined,
      color: searchParams.get("color") ?? undefined,
      in_stock: searchParams.get("in_stock") === "1",
    }),
    [searchParams],
  );

  const title = shopTitle(mode, q);

  const queryString = useMemo(() => {
    const query: Record<string, string | number | boolean | undefined> = {
      ...filters,
      subcategory: filters.subcategory.join(","),
      sort,
      page,
      limit: PAGE_SIZE,
    };
    if (mode.kind === "category") query.category = mode.category;
    if (mode.kind === "tag") query.tag = mode.tag;
    if (mode.kind === "sale") query.on_sale = true;
    if (mode.kind === "search") query.q = q;
    return productsQueryString(query as never);
  }, [filters, sort, page, mode, q]);

  const { data, isLoading } = useQuery({
    queryKey: ["products", queryString],
    queryFn: () => apiGet<ProductListResponse>(`/products?${queryString}`),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    document.title = `${title} · Salesphere`;
  }, [title]);

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    setSearchParams(next, { preventScrollReset: true });
  };

  const applyFilters = (next: FilterState) => {
    const nextParams = new URLSearchParams();
    if (mode.kind === "search" && q) nextParams.set("q", q);
    if (next.subcategory.length) nextParams.set("subcategory", next.subcategory.join(","));
    if (next.min_price !== undefined) nextParams.set("min_price", String(next.min_price));
    if (next.max_price !== undefined) nextParams.set("max_price", String(next.max_price));
    if (next.size) nextParams.set("size", next.size);
    if (next.color) nextParams.set("color", next.color);
    if (next.in_stock) nextParams.set("in_stock", "1");
    if (sort) nextParams.set("sort", sort);
    setSearchParams(nextParams, { preventScrollReset: true });
  };

  const subcategories =
    mode.kind === "category" ? SUBCATEGORIES[mode.category] : [];

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0 });
  };

  const hasFilters =
    filters.subcategory.length > 0 ||
    filters.min_price !== undefined ||
    filters.max_price !== undefined ||
    filters.size !== undefined ||
    filters.color !== undefined ||
    filters.in_stock;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" data-testid="shop-page">
      {/* page header */}
      <div className="mb-8 border-b border-border pb-6">
        <p className="overline-label">{shopOverline(mode)}</p>
        <h1 className="mt-2 font-heading text-4xl font-medium tracking-tight sm:text-5xl">{title}</h1>
        {data && (
          <p className="mt-2 text-sm text-muted-foreground" data-testid="shop-result-count">
            {data.total} product{data.total === 1 ? "" : "s"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* sidebar (desktop) */}
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-32">
            <FilterPanel subcategories={subcategories} state={filters} onChange={applyFilters} resultCount={data?.total ?? 0} />
          </div>
        </aside>

        <div className="lg:col-span-9">
          {/* controls */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" size="sm" className="lg:hidden" data-testid="shop-filters-button" />
                }
              >
                <SlidersHorizontal size={15} /> Filters{hasFilters ? " · on" : ""}
              </SheetTrigger>
              <SheetContent side="left" className="w-85 overflow-y-auto p-6">
                <SheetHeader>
                  <SheetTitle className="font-heading text-2xl">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <FilterPanel subcategories={subcategories} state={filters} onChange={applyFilters} resultCount={data?.total ?? 0} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <label htmlFor="shop-sort" className="hidden text-xs uppercase tracking-[0.16em] text-muted-foreground sm:block">
                Sort by
              </label>
              <Select value={sort} onValueChange={(value) => setParam("sort", value)}>
                <SelectTrigger id="shop-sort" className="w-48" data-testid="shop-sort-select">
                  <SelectValue>{SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* grid / empty */}
          {isLoading && !data ? (
            <ProductGrid products={[]} isLoading />
          ) : data && data.items.length === 0 ? (
            <EmptyState
              icon={<PackageSearch size={22} className="text-muted-foreground" />}
              title="No products match"
              description="Try adjusting your filters or search — or browse the full collection instead."
              actionLabel={hasFilters || q ? "Reset filters" : "Browse new arrivals"}
              actionTo={hasFilters || q ? basePath(mode) : "/new-arrivals"}
              testId="shop-empty-state"
            />
          ) : data ? (
            <>
              <ProductGrid products={data.items} />
              {data.pages > 1 && (
                <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination" data-testid="shop-pagination">
                  <Button variant="outline" size="sm" disabled={data.page <= 1} onClick={() => goToPage(data.page - 1)} data-testid="shop-pagination-prev">
                    Prev
                  </Button>
                  {Array.from({ length: data.pages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === data.pages || Math.abs(p - data.page) <= 1)
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-muted-foreground">…</span>}
                        <button
                          type="button"
                          onClick={() => goToPage(p)}
                          data-testid={`shop-pagination-page-${p}`}
                          aria-current={p === data.page ? "page" : undefined}
                          className={`h-9 w-9 border font-mono text-sm transition ${
                            p === data.page ? "border-foreground bg-foreground text-white" : "border-border hover:border-foreground"
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                  <Button variant="outline" size="sm" disabled={data.page >= data.pages} onClick={() => goToPage(data.page + 1)} data-testid="shop-pagination-next">
                    Next
                  </Button>
                </nav>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function parseNum(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function defaultSort(mode: ShopMode): string {
  if (mode.kind === "tag" && mode.tag === "new") return "newest";
  if (mode.kind === "sale") return "discount";
  return "popular";
}

function shopOverline(mode: ShopMode): string {
  if (mode.kind === "category") return CATEGORY_META[mode.category].overline;
  if (mode.kind === "tag") return "Just Dropped";
  if (mode.kind === "sale") return "Exclusive Deals";
  return "Search";
}

function shopTitle(mode: ShopMode, q: string): string {
  if (mode.kind === "category") return CATEGORY_META[mode.category].title;
  if (mode.kind === "tag") return mode.tag === "new" ? "New Arrivals" : "Collections";
  if (mode.kind === "sale") return "Sale";
  return q ? `Results for “${q}”` : "Search";
}

function basePath(mode: ShopMode): string {
  if (mode.kind === "category") return mode.category === "home" ? "/home-essentials" : `/${mode.category}`;
  if (mode.kind === "tag") return "/new-arrivals";
  if (mode.kind === "sale") return "/sale";
  return "/search";
}
