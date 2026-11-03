import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Flame, Gift, Flower2, Home as HomeIcon, CheckCircle2, ChevronRight, SlidersHorizontal, ArrowRight } from "lucide-react";
import { apiGet } from "@/lib/api";
import { buttonVariants, Button } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { ProductRail } from "@/components/ProductRail";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterPanel, EMPTY_FILTERS, type FilterState } from "@/components/shop/FilterPanel";
import { SUBCATEGORIES, SORT_OPTIONS, PAGE_SIZE, productsQueryString } from "@/lib/catalog";
import type { ProductListResponse, ProductQuery, Product } from "@/types";

const HERO_BG = "/photos_for_homeessential/bc14e333-472a-429e-b428-e95551bf48b8.jpg";

// Category quick cards matching approved photoshoot
const CATEGORY_CARDS = [
  {
    name: "Diyas & Deepams",
    subcat: "Diyas & Deepams",
    image: "/photos_for_homeessential/1d54ed9d-5e50-46ec-8407-7c711e1a8d02.jpg",
    desc: "Brass lotus deepams, clay sets & standing lamps",
  },
  {
    name: "Festive Lighting",
    subcat: "Festive Lighting",
    image: "/photos_for_homeessential/3d0b11cb-1948-4ddd-973e-aee246f2f6f5.jpg",
    desc: "Golden LED curtain fairy lights & illuminations",
  },
  {
    name: "Lanterns & Kandils",
    subcat: "Lanterns & Kandils",
    image: "/photos_for_homeessential/9f78caa2-4c5d-451c-9031-5ed3f7e13aa5.jpg",
    desc: "Traditional hanging kandils & brass lanterns",
  },
  {
    name: "Rangoli & Floor Décor",
    subcat: "Rangoli & Floor Décor",
    image: "/photos_for_homeessential/54823c4a-19b9-4c7a-8cdc-2d0f910a80fa.jpg",
    desc: "Herbal colour powder sets & decorative mats",
  },
  {
    name: "Pooja Essentials",
    subcat: "Pooja Essentials",
    image: "/photos_for_homeessential/dea9d291-4a41-4148-8bbf-8c01e884d49b.jpg",
    desc: "Brass pooja thalis, kalash sets & festive idols",
  },
  {
    name: "Urli & Brass Décor",
    subcat: "Urli & Brass Décor",
    image: "/photos_for_homeessential/31fec69b-c1a9-4ac7-b26c-1987173c2ab8.jpg",
    desc: "Hammered brass urlis & floating lotus candles",
  },
  {
    name: "Entrance Décor & Torans",
    subcat: "Entrance Décor & Torans",
    image: "/photos_for_homeessential/77693b4e-d814-4e2e-8492-c060d55119eb.jpg",
    desc: "Marigold entrance sets & beaded door torans",
  },
  {
    name: "Festive Home Styling",
    subcat: "Festive Home Styling",
    image: "/photos_for_homeessential/6a64b8b2-829f-4a95-9caf-dadc58f6506c.jpg",
    desc: "Living room styling collections & cushion sets",
  },
];

// Occasions for celebration shopping
const OCCASIONS = [
  {
    title: "Diwali (Deepavali)",
    tagline: "Festival of Lights & Auspicious Diyas",
    querySubcat: "Diyas & Deepams",
    image: "/photos_for_homeessential/1d54ed9d-5e50-46ec-8407-7c711e1a8d02.jpg",
    badge: "Most Popular",
  },
  {
    title: "Ganesh Chaturthi",
    tagline: "Lakshmi Ganesha Murtis & Pooja Altars",
    querySubcat: "Pooja Essentials",
    image: "/photos_for_homeessential/6a98c18e-14e3-4057-87f5-073636f4adea.jpg",
    badge: "Spiritual",
  },
  {
    title: "Navratri & Dussehra",
    tagline: "Grand Doorway Welcome & Marigolds",
    querySubcat: "Entrance Décor & Torans",
    image: "/photos_for_homeessential/77693b4e-d814-4e2e-8492-c060d55119eb.jpg",
    badge: "Festive Welcome",
  },
  {
    title: "Weddings & Royal Dining",
    tagline: "Banquet Silk Runners & Brass Peacocks",
    querySubcat: "Festive Home Styling",
    image: "/photos_for_homeessential/8ccf57ef-0014-4e64-b155-af6f31bd83ff.jpg",
    badge: "Royal Luxury",
  },
  {
    title: "Griha Pravesh & Housewarming",
    tagline: "Floating Flower Urlis & Sacred Kalash",
    querySubcat: "Urli & Brass Décor",
    image: "/photos_for_homeessential/31fec69b-c1a9-4ac7-b26c-1987173c2ab8.jpg",
    badge: "New Beginnings",
  },
  {
    title: "Temple & Daily Aarti",
    tagline: "Carved Brass Thalis & Standing Deepams",
    querySubcat: "Pooja Essentials",
    image: "/photos_for_homeessential/dea9d291-4a41-4148-8bbf-8c01e884d49b.jpg",
    badge: "Sacred Aarti",
  },
];

// Helper component for curated sections
function CuratedSectionRail({
  id,
  overline,
  title,
  subcat,
  tag,
  sort = "popular",
  onSelectSubcat,
}: {
  id: string;
  overline: string;
  title: string;
  subcat?: string;
  tag?: string;
  sort?: string;
  onSelectSubcat?: (sc: string) => void;
}) {
  const query: ProductQuery = { category: "home", limit: 8, sort: sort as any };
  if (subcat) query.subcategory = subcat;
  if (tag) query.tag = tag;

  const qs = productsQueryString(query);
  const { data, isLoading } = useQuery({
    queryKey: ["home-section", qs],
    queryFn: () => apiGet<ProductListResponse>(`/products?${qs}`),
  });

  if (!isLoading && !data?.items.length) return null;

  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-14 sm:px-6 lg:px-8" data-testid={`festive-home-${id}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">{overline}</p>
          <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">{title}</h2>
        </div>
        {subcat && onSelectSubcat && (
          <button
            type="button"
            onClick={() => onSelectSubcat(subcat)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#D4AF37] hover:underline"
          >
            <span>View All ({data?.total ?? 0})</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
      <ProductRail products={data?.items ?? []} />
    </section>
  );
}

export default function HomeEssentials() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>("curated");

  const selectedSubcat = searchParams.get("subcategory") ?? "";
  const sort = searchParams.get("sort") ?? "popular";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const filters: FilterState = useMemo(
    () => ({
      subcategory: selectedSubcat ? selectedSubcat.split(",").filter(Boolean) : [],
      min_price: searchParams.get("min_price") ? parseInt(searchParams.get("min_price")!, 10) : undefined,
      max_price: searchParams.get("max_price") ? parseInt(searchParams.get("max_price")!, 10) : undefined,
      size: searchParams.get("size") ?? undefined,
      color: searchParams.get("color") ?? undefined,
      in_stock: searchParams.get("in_stock") === "1",
    }),
    [searchParams, selectedSubcat]
  );

  useEffect(() => {
    document.title = "Indian Festive Home Décor & Diwali Shopping · Salesphere";
  }, []);

  // Full catalog query for grid browsing
  const gridQueryString = useMemo(() => {
    const q: Record<string, string | number | boolean | undefined> = {
      category: "home",
      ...filters,
      subcategory: filters.subcategory.join(","),
      sort,
      page,
      limit: 16,
    };
    return productsQueryString(q as never);
  }, [filters, sort, page]);

  const { data: gridData, isLoading: gridLoading } = useQuery({
    queryKey: ["home-grid", gridQueryString],
    queryFn: () => apiGet<ProductListResponse>(`/products?${gridQueryString}`),
  });

  const handleSubcatClick = (subcat: string) => {
    setActiveTab("browse");
    const next = new URLSearchParams(searchParams);
    if (subcat) {
      next.set("subcategory", subcat);
    } else {
      next.delete("subcategory");
    }
    next.delete("page");
    setSearchParams(next);
    // Smooth scroll to catalog section
    setTimeout(() => {
      document.getElementById("festive-catalog")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="bg-background text-foreground" data-testid="home-essentials-festive-page">
      {/* 1. EDITORIAL HERO BANNER */}
      <section className="relative flex min-h-[520px] items-end overflow-hidden bg-[#1E0F0A] lg:min-h-[620px]">
        <ImageWithFallback
          src={HERO_BG}
          alt="Indian festive home decor with glowing brass diyas and marigold garlands"
          eager
          className="absolute inset-0 h-full w-full object-cover object-center brightness-90"
        />
        {/* Luxury gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(25, 12, 8, 0.92) 0%, rgba(35, 16, 10, 0.65) 50%, rgba(20, 10, 6, 0.3) 100%), linear-gradient(to top, rgba(25, 12, 8, 0.95) 0%, transparent 40%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#1E0F0A]/80 px-3.5 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-[#E8C547] backdrop-blur-sm shadow-lg">
              <Sparkles size={13} className="text-[#E8C547]" />
              <span>Diwali & Indian Festive Celebration Destination</span>
            </div>

            <h1 className="mt-5 font-heading text-4xl font-normal leading-[1.08] tracking-tight text-white sm:text-6xl">
              Light Up Your Celebrations
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#F4EBE1] sm:text-lg">
              Elevate your home with pure brass peacock diyas, fresh-look marigold torans, handcrafted pooja thalis, solid lotus urlis, and festive royal hampers.
            </p>

            {/* Quick jump navigation pills */}
            <div className="mt-7 flex flex-wrap gap-2.5">
              <a
                href="#diwali-special"
                className={buttonVariants({
                  size: "sm",
                  className: "border-[#D4AF37] bg-[#D4AF37] text-stone-950 font-semibold hover:bg-[#c29b2b] shadow-md",
                })}
              >
                <Flame size={14} className="mr-1" />
                Diwali Special
              </a>
              <a
                href="#light-up"
                className={buttonVariants({
                  size: "sm",
                  variant: "outline",
                  className: "border-white/40 bg-black/30 text-white hover:bg-white hover:text-stone-950 backdrop-blur-sm",
                })}
              >
                Lighting & Kandils
              </a>
              <a
                href="#pooja-essentials"
                className={buttonVariants({
                  size: "sm",
                  variant: "outline",
                  className: "border-white/40 bg-black/30 text-white hover:bg-white hover:text-stone-950 backdrop-blur-sm",
                })}
              >
                Pooja Essentials
              </a>
              <a
                href="#festive-hampers"
                className={buttonVariants({
                  size: "sm",
                  variant: "outline",
                  className: "border-white/40 bg-black/30 text-white hover:bg-white hover:text-stone-950 backdrop-blur-sm",
                })}
              >
                Gifts & Hampers
              </a>
              <a
                href="#shop-by-occasion"
                className={buttonVariants({
                  size: "sm",
                  variant: "outline",
                  className: "border-[#D4AF37]/50 bg-black/30 text-[#E8C547] hover:bg-[#D4AF37] hover:text-stone-950 backdrop-blur-sm",
                })}
              >
                Shop by Occasion
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Craftsmanship banner */}
      <div className="border-y border-[#D4AF37]/20 bg-[#FAF7F2] dark:bg-stone-950/60 py-3.5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-xs uppercase tracking-[0.18em] text-[#8C6D23] sm:px-6 lg:px-8">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 size={14} className="text-[#D4AF37]" /> 100% Pure Virgin Brass
          </span>
          <span className="hidden sm:inline text-muted-foreground/40">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 size={14} className="text-[#D4AF37]" /> Authentic Handcrafted Indian Art
          </span>
          <span className="hidden sm:inline text-muted-foreground/40">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 size={14} className="text-[#D4AF37]" /> Free Express Shipping Over ₹1,499
          </span>
          <span className="hidden sm:inline text-muted-foreground/40">•</span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 size={14} className="text-[#D4AF37]" /> Safe Shubh Gifting Packing
          </span>
        </div>
      </div>

      {/* CATEGORY SHOWCASE TILES */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">Artisanal Categories</p>
          <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight sm:text-3xl">Explore Festive Collections</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            From sanctified pooja thalis to illuminated akash kandils and fragrant soy candles.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
          {CATEGORY_CARDS.map((cat) => (
            <button
              key={cat.subcat}
              type="button"
              onClick={() => handleSubcatClick(cat.subcat)}
              className="group relative flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card text-left shadow-sm transition hover:shadow-md hover:border-[#D4AF37]/50"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <h3 className="font-heading text-sm font-semibold text-foreground group-hover:text-[#D4AF37] transition-colors leading-snug">
                  {cat.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* VIEW TOGGLE TABS: Curated Rails vs Browse All */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab("curated")}
            className={`pb-3 px-4 text-sm font-semibold uppercase tracking-wider transition border-b-2 ${
              activeTab === "curated"
                ? "border-[#D4AF37] text-foreground font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Curated Festive Rails (10 Sections)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("browse")}
            className={`pb-3 px-4 text-sm font-semibold uppercase tracking-wider transition border-b-2 ${
              activeTab === "browse"
                ? "border-[#D4AF37] text-foreground font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Browse All Festive Decor ({gridData?.total ?? 24})
          </button>
        </div>
      </div>

      {activeTab === "curated" ? (
        <div className="pt-2">
          {/* SECTION 1: Diwali Special Collection */}
          <CuratedSectionRail
            id="diwali-special"
            overline="Special Festival Feature"
            title="1. Diwali Special Collection"
            tag="diwali"
            sort="popular"
            onSelectSubcat={handleSubcatClick}
          />

          {/* SECTION 2: Diyas & Deepams */}
          <CuratedSectionRail
            id="diyas-deepams"
            overline="Sacred Illumination"
            title="2. Diyas & Deepams — Brass, Clay & Lotus Sets"
            subcat="Diyas & Deepams"
            sort="popular"
            onSelectSubcat={handleSubcatClick}
          />

          {/* SECTION 3: Festive Lighting & Curtain Lights */}
          <CuratedSectionRail
            id="festive-lighting"
            overline="Golden Ambience"
            title="3. Festive Lighting & LED Curtain Lights"
            subcat="Festive Lighting"
            sort="popular"
            onSelectSubcat={handleSubcatClick}
          />

          {/* SECTION 4: Traditional Hanging Kandils & Lanterns */}
          <CuratedSectionRail
            id="hanging-kandils"
            overline="Balcony & Courtyard"
            title="4. Traditional Hanging Diwali Kandils & Lanterns"
            subcat="Lanterns & Kandils"
            sort="popular"
            onSelectSubcat={handleSubcatClick}
          />

          {/* SECTION 5: Entrance Décor & Door Torans */}
          <CuratedSectionRail
            id="entrance-torans"
            overline="Auspicious Threshold"
            title="5. Entrance Décor & Beaded Door Torans"
            subcat="Entrance Décor & Torans"
            sort="popular"
            onSelectSubcat={handleSubcatClick}
          />

          {/* SECTION 6: Pooja & Spiritual Essentials */}
          <CuratedSectionRail
            id="pooja-essentials"
            overline="Devotion & Mandir"
            title="6. Pooja Essentials — Aarti Thalis, Kalash & Idols"
            subcat="Pooja Essentials"
            sort="popular"
            onSelectSubcat={handleSubcatClick}
          />

          {/* SECTION 7: Rangoli and Floor Décor */}
          <CuratedSectionRail
            id="rangoli-floor"
            overline="Artistry & Colors"
            title="7. Rangoli and Floor Décor — Powders & Mats"
            subcat="Rangoli & Floor Décor"
            sort="popular"
            onSelectSubcat={handleSubcatClick}
          />

          {/* SECTION 8: Urli & Brass Décor */}
          <CuratedSectionRail
            id="urli-decor"
            overline="Centerpiece Elegance"
            title="8. Urli & Brass Décor — Floating Lotus Flowers"
            subcat="Urli & Brass Décor"
            sort="popular"
            onSelectSubcat={handleSubcatClick}
          />

          {/* SECTION 9: Festive Home Styling */}
          <CuratedSectionRail
            id="festive-styling"
            overline="Living Room & Dining Grandeur"
            title="9. Festive Home Styling — Cushions & Table Sets"
            subcat="Festive Home Styling"
            sort="popular"
            onSelectSubcat={handleSubcatClick}
          />

          {/* SECTION 8: Shop by Occasion */}
          <section id="shop-by-occasion" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-16 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">Celebrations</p>
              <h2 className="mt-1 font-heading text-3xl font-medium tracking-tight">8. Shop by Occasion</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Handcrafted collections for India's most auspicious festivals, pujas, and family milestones.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {OCCASIONS.map((occ) => (
                <div
                  key={occ.title}
                  onClick={() => handleSubcatClick(occ.querySubcat)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-lg hover:border-[#D4AF37]/60"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden">
                    <ImageWithFallback
                      src={occ.image}
                      alt={occ.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                    <span className="inline-block rounded bg-[#D4AF37] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                      {occ.badge}
                    </span>
                    <h3 className="mt-2 font-heading text-xl font-semibold leading-tight">{occ.title}</h3>
                    <p className="mt-1 text-xs text-white/80">{occ.tagline}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#E8C547] group-hover:underline">
                      Explore Collection <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 9: Bestselling Festive Décor */}
          <CuratedSectionRail
            id="bestselling"
            overline="Customer Favorites"
            title="9. Bestselling Festive Décor"
            tag="bestseller"
            sort="popular"
            onSelectSubcat={handleSubcatClick}
          />

          {/* SECTION 10: New Festive Arrivals */}
          <CuratedSectionRail
            id="new-arrivals"
            overline="Fresh for the Season"
            title="10. New Festive Arrivals"
            tag="festive"
            sort="newest"
            onSelectSubcat={handleSubcatClick}
          />
        </div>
      ) : null}

      {/* FULL CATALOG GRID / FILTER SECTION */}
      <section id="festive-catalog" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 border-t border-border">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">Complete Catalogue</p>
            <h2 className="mt-1 font-heading text-2xl font-medium tracking-tight sm:text-3xl">
              Browse All Festive Décor & Essentials
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Showing {gridData?.items.length ?? 0} of {gridData?.total ?? 0} Indian festive products
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter sheet */}
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="outline" size="sm" className="lg:hidden" data-testid="home-filters-button" />
                }
              >
                <SlidersHorizontal size={14} className="mr-2" />
                Filters
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto sm:w-[360px]">
                <SheetHeader>
                  <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel
                    subcategories={SUBCATEGORIES.home ?? []}
                    state={filters}
                    resultCount={gridData?.total ?? 0}
                    onChange={(nextFilters) => {
                      const next = new URLSearchParams(searchParams);
                      if (nextFilters.subcategory?.length) next.set("subcategory", nextFilters.subcategory.join(","));
                      else next.delete("subcategory");
                      if (nextFilters.min_price) next.set("min_price", String(nextFilters.min_price));
                      else next.delete("min_price");
                      if (nextFilters.max_price) next.set("max_price", String(nextFilters.max_price));
                      else next.delete("max_price");
                      if (nextFilters.color) next.set("color", nextFilters.color);
                      else next.delete("color");
                      if (nextFilters.size) next.set("size", nextFilters.size);
                      else next.delete("size");
                      if (nextFilters.in_stock) next.set("in_stock", "1");
                      else next.delete("in_stock");
                      next.delete("page");
                      setSearchParams(next);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort selector */}
            <Select
              value={sort}
              onValueChange={(val) => {
                const next = new URLSearchParams(searchParams);
                next.set("sort", val);
                next.delete("page");
                setSearchParams(next);
              }}
            >
              <SelectTrigger className="w-[180px] text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subcategory horizontal pills */}
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-6 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <button
            type="button"
            onClick={() => handleSubcatClick("")}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              !selectedSubcat
                ? "border-[#D4AF37] bg-[#D4AF37] text-stone-950 shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-[#D4AF37] hover:text-foreground"
            }`}
          >
            All Categories
          </button>
          {SUBCATEGORIES.home?.map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => handleSubcatClick(sc)}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                selectedSubcat === sc
                  ? "border-[#D4AF37] bg-[#D4AF37] text-stone-950 shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-[#D4AF37] hover:text-foreground"
              }`}
            >
              {sc}
            </button>
          ))}
        </div>

        {/* Grid layout with desktop sidebar */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 rounded-lg border border-border/80 bg-card p-5 shadow-sm">
              <FilterPanel
                subcategories={SUBCATEGORIES.home ?? []}
                state={filters}
                resultCount={gridData?.total ?? 0}
                onChange={(nextFilters) => {
                  const next = new URLSearchParams(searchParams);
                  if (nextFilters.subcategory?.length) next.set("subcategory", nextFilters.subcategory.join(","));
                  else next.delete("subcategory");
                  if (nextFilters.min_price) next.set("min_price", String(nextFilters.min_price));
                  else next.delete("min_price");
                  if (nextFilters.max_price) next.set("max_price", String(nextFilters.max_price));
                  else next.delete("max_price");
                  if (nextFilters.color) next.set("color", nextFilters.color);
                  else next.delete("color");
                  if (nextFilters.size) next.set("size", nextFilters.size);
                  else next.delete("size");
                  if (nextFilters.in_stock) next.set("in_stock", "1");
                  else next.delete("in_stock");
                  next.delete("page");
                  setSearchParams(next);
                }}
              />
            </div>
          </aside>

          <main className="lg:col-span-3">
            <ProductGrid products={gridData?.items ?? []} isLoading={gridLoading} />

            {/* Pagination */}
            {gridData && gridData.pages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: gridData.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set("page", String(p));
                      setSearchParams(next);
                      document.getElementById("festive-catalog")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`h-9 w-9 rounded-md font-mono text-xs font-semibold transition ${
                      page === p
                        ? "bg-[#D4AF37] text-stone-950"
                        : "border border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}
