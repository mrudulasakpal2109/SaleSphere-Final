import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Banknote, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { apiGet } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { SectionHeading } from "@/components/SectionHeading";
import { ProductRail } from "@/components/ProductRail";
import { NewsletterSection } from "@/components/NewsletterSection";
import type { ProductListResponse } from "@/types";

const CAMPAIGN = {
  hero: "https://images.unsplash.com/photo-1720477188649-988d89d84091?auto=format&fit=crop&w=1800&q=80",
  promo: "https://images.pexels.com/photos/3155493/pexels-photo-3155493.jpeg?auto=compress&cs=tinysrgb&w=1200",
  tile_men: "https://images.unsplash.com/photo-1617114919297-3c8ddb01f599?auto=format&fit=crop&w=900&q=80",
  tile_women: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=900&q=80",
  tile_kids: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=80",
  tile_home: "/photos_for_homeessential/31fec69b-c1a9-4ac7-b26c-1987173c2ab8.jpg",
};

const TRUST_BADGES = [
  { icon: Banknote, title: "Cash on Delivery", copy: "Pay at your doorstep, zero extra fees" },
  { icon: RotateCcw, title: "7-Day Easy Returns", copy: "Hassle-free doorstep pickup" },
  { icon: ShieldCheck, title: "Quality Assured", copy: "Curated and checked in-house" },
  { icon: Truck, title: "Express Delivery", copy: "Dispatched within 24–48 hours" },
];

const CATEGORY_TILES = [
  { to: "/men", label: "Men", copy: "Sharp essentials & weekend staples", img: CAMPAIGN.tile_men, testId: "category-tile-men" },
  { to: "/women", label: "Women", copy: "Dresses, kurtas & elevated basics", img: CAMPAIGN.tile_women, testId: "category-tile-women" },
  { to: "/kids", label: "Kids", copy: "Playful picks for little icons", img: CAMPAIGN.tile_kids, testId: "category-tile-kids" },
  { to: "/home-essentials", label: "Home Essentials", copy: "Festive décor, brass diyas, torans & pooja essentials", img: CAMPAIGN.tile_home, testId: "category-tile-home" },
];

function useRail(queryString: string) {
  return useQuery({
    queryKey: ["home-rail", queryString],
    queryFn: () => apiGet<ProductListResponse>(`/products?${queryString}`),
    staleTime: 60 * 1000,
  });
}

export default function Home() {
  const newArrivals = useRail("tag=new&sort=newest&limit=8");
  const trending = useRail("tag=trending&sort=popular&limit=8");
  const bestsellers = useRail("tag=bestseller&sort=popular&limit=8");
  const seasonal = useRail("tag=seasonal&limit=8");
  const homeEssentials = useRail("category=home&sort=popular&limit=8");
  const sale = useRail("on_sale=true&sort=discount&limit=8");
  const recommended = useRail("sort=rating&limit=8");

  const rail = (r: ReturnType<typeof useRail>) =>
    r.data && r.data.items.length > 0 ? r.data.items : [];

  return (
    <div>
      {/* ---------------- hero ---------------- */}
      <section className="relative flex min-h-[560px] items-end overflow-hidden bg-[#1A1513] lg:min-h-[680px]" data-testid="home-hero">
        <ImageWithFallback
          src={CAMPAIGN.hero}
          alt="A family dressed in Salesphere autumn coats walking outdoors"
          eager
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(18,18,18,0.78) 0%, rgba(18,18,18,0.38) 60%, rgba(18,18,18,0.08) 100%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-40 sm:px-6 lg:px-8 lg:pb-24">
          <div className="max-w-xl animate-fade-up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F5C29A]">
              New Season · Salesphere
            </p>
            <h1 className="mt-4 font-heading text-5xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Your Style. Your&nbsp;Sphere.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#E5DFD7]">
              Discover fashion for men, women and kids — curated collections, exclusive deals and
              cash on delivery across India.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/new-arrivals"
                className={buttonVariants({ size: "lg", className: "bg-white text-[#121212] hover:bg-sale hover:text-white" })}
                data-testid="hero-shop-now-button"
              >
                Shop Now
              </Link>
              <Link
                to="/sale"
                className={buttonVariants({ size: "lg", variant: "outline", className: "border-white/40 bg-transparent text-white hover:bg-white hover:text-[#121212]" })}
                data-testid="hero-sale-button"
              >
                Explore the Sale
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-[#E5DFD7]">
              {[
                { to: "/men", label: "Shop Men" },
                { to: "/women", label: "Shop Women" },
                { to: "/kids", label: "Shop Kids" },
                { to: "/home-essentials", label: "Shop Home" },
              ].map((l) => (
                <Link key={l.to} to={l.to} data-testid={`hero-${l.label.replace(/\s/g, "-").toLowerCase()}`} className="border-b border-[#F5C29A]/60 pb-0.5 transition-colors hover:text-[#F5C29A]">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- trust strip ---------------- */}
      <section className="border-b border-border bg-card" data-testid="trust-strip">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          {TRUST_BADGES.map((b) => (
            <div key={b.title} className="flex items-start gap-3">
              <b.icon size={20} className="mt-0.5 shrink-0 text-sale" />
              <div>
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{b.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- categories ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" data-testid="home-categories">
        <SectionHeading overline="Shop by Category" title="Made for every you" linkTo="/new-arrivals" linkLabel="View all" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {CATEGORY_TILES.map((tile) => (
            <Link
              key={tile.to}
              to={tile.to}
              data-testid={tile.testId}
              className="group relative block overflow-hidden bg-[#F3EFEA]"
            >
              <div className="aspect-[4/5] w-full overflow-hidden">
                <ImageWithFallback
                  src={tile.img}
                  alt={`Salesphere ${tile.label} collection`}
                  className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#121212]/85 via-[#121212]/25 to-transparent p-6 pt-16">
                <h3 className="font-heading text-2xl font-medium text-white">{tile.label}</h3>
                <p className="mt-1 text-sm text-[#E5DFD7]">{tile.copy}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 border-b border-white/60 pb-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors group-hover:border-sale group-hover:text-[#F5C29A]">
                  Shop now <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- new arrivals ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" data-testid="home-new-arrivals">
        <SectionHeading overline="Just Dropped" title="New Arrivals" linkTo="/new-arrivals" linkLabel="View all" />
        <ProductRail products={rail(newArrivals)} />
      </section>

      {/* ---------------- promo banner ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" data-testid="home-promo-banner">
        <div className="grid grid-cols-1 overflow-hidden border border-border lg:grid-cols-2">
          <div className="relative min-h-[320px]">
            <ImageWithFallback
              src={CAMPAIGN.promo}
              alt="Model in a beige trench coat for the Salesphere mid-season edit"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </div>
          <div className="flex flex-col items-start justify-center bg-[#121212] p-8 text-white lg:p-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#F5C29A]">Limited Time</p>
            <h3 className="mt-3 font-heading text-4xl font-medium leading-tight tracking-tight lg:text-5xl">
              The Mid-Season Sale
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#B5AEA4]">
              Up to 40% off across tees, dresses, ethnic wear and more. Fresh markdowns on
              bestsellers — while stock lasts.
            </p>
            <Link
              to="/sale"
              className={buttonVariants({ size: "lg", className: "mt-8 bg-white text-[#121212] hover:bg-sale hover:text-white" })}
              data-testid="promo-shop-sale-button"
            >
              Shop the Sale
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- trending ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" data-testid="home-trending">
        <SectionHeading overline="Community Favourites" title="Trending Now" linkTo="/search?q=denim" linkLabel="Explore" />
        <ProductRail products={rail(trending)} />
      </section>

      {/* ---------------- seasonal ---------------- */}
      <section className="bg-stone-subtle py-16" data-testid="home-seasonal">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading overline="Collections" title="Seasonal Edits" linkTo="/women" linkLabel="Shop women" />
          <ProductRail products={rail(seasonal)} />
        </div>
      </section>

      {/* ---------------- home essentials ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" data-testid="home-essentials-section">
        <SectionHeading overline="Festive Indian Living" title="Indian Festive Décor & Home Essentials" linkTo="/home-essentials" linkLabel="Explore Festive Home" />
        <ProductRail products={rail(homeEssentials)} />
      </section>

      {/* ---------------- sale ---------------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" data-testid="home-sale">
        <SectionHeading overline="Exclusive Deals" title="On Sale Now" linkTo="/sale" linkLabel="All deals" />
        <ProductRail products={rail(sale)} />
      </section>

      {/* ---------------- bestsellers ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8" data-testid="home-bestsellers">
        <SectionHeading overline="Loved by Many" title="Bestsellers" linkTo="/men" linkLabel="Shop men" />
        <ProductRail products={rail(bestsellers)} />
      </section>

      {/* ---------------- recommended ---------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8" data-testid="home-recommended">
        <SectionHeading overline="Picked for You" title="Recommended" linkTo="/kids" linkLabel="Shop kids" />
        <ProductRail products={rail(recommended)} />
      </section>

      <NewsletterSection />
    </div>
  );
}
