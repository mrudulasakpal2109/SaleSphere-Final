import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { ProductRail } from "@/components/ProductRail";
import { SectionHeading } from "@/components/SectionHeading";
import { productsQueryString } from "@/lib/catalog";
import type { ProductListResponse, ProductQuery } from "@/types";

const HERO = "https://images.unsplash.com/photo-1735052711950-c31c729c2a4e?auto=format&fit=crop&w=1800&q=80";

const SECTIONS: { id: string; short: string; overline: string; title: string; query: ProductQuery; link: string }[] = [
  { id: "lehengas-sarees", short: "Lehengas & Sarees", overline: "Wedding season", title: "Lehengas & Sarees", query: { category: "women", subcategory: "Ethnic Wear", tag: "festive", limit: 8 }, link: "/women?subcategory=Ethnic+Wear" },
  { id: "kurtas", short: "Kurtas", overline: "Diwali evenings", title: "Festive Kurtas & Anarkalis", query: { category: "women", subcategory: "Kurtas", tag: "festive", limit: 8 }, link: "/women?subcategory=Kurtas" },
  { id: "men", short: "Men", overline: "For him", title: "Kurtas, Nehru Jackets & Sherwanis", query: { category: "men", tag: "festive", limit: 8 }, link: "/men?subcategory=Ethnic+Wear" },
  { id: "kids", short: "Kids", overline: "Little celebrations", title: "Kids' Festive Wear", query: { category: "kids", tag: "festive", limit: 8 }, link: "/kids?subcategory=Ethnic+Wear" },
  { id: "home", short: "Festive Home", overline: "Decor & Glow", title: "Festive Home, Lights & Decor", query: { category: "home", tag: "festive", limit: 8 }, link: "/home-essentials" },
];

function FestiveSection({ section }: { section: (typeof SECTIONS)[number] }) {
  const qs = productsQueryString({ ...section.query, sort: "popular" });
  const { data, isLoading } = useQuery({
    queryKey: ["festive", qs],
    queryFn: () => apiGet<ProductListResponse>(`/products?${qs}`),
  });
  if (!isLoading && !data?.items.length) return null;
  return (
    <section id={section.id} className="mx-auto max-w-7xl scroll-mt-32 px-4 pb-16 sm:px-6 lg:px-8" data-testid={`festive-section-${section.id}`}>
      <SectionHeading overline={section.overline} title={section.title} linkTo={section.link} linkLabel="View all" />
      <ProductRail products={data?.items ?? []} />
    </section>
  );
}

export default function Festive() {
  useEffect(() => {
    document.title = "The Festive Edit · Salesphere";
  }, []);

  return (
    <div data-testid="festive-page">
      <section className="relative flex min-h-[480px] items-end overflow-hidden bg-[#2A1410] lg:min-h-[560px]">
        <ImageWithFallback src={HERO} alt="A couple in Indian wedding attire" eager className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(42,20,16,0.85) 0%, rgba(42,20,16,0.45) 55%, rgba(42,20,16,0.1) 100%)" }} />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-32 sm:px-6 lg:px-8">
          <div className="max-w-xl animate-fade-up">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E8C547]">Diwali & Wedding Season</p>
            <h1 className="mt-4 font-heading text-5xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl">The Festive Edit</h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#F1E6D8]">
              Lehengas, silk sarees, kurtas, sherwanis and little festive looks, dressed for every puja, sangeet and celebration.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <a key={s.id} href={`#${s.id}`} data-testid={`festive-jump-${s.id}`} className={buttonVariants({ size: "sm", variant: "outline", className: "border-white/40 bg-transparent text-white hover:bg-white hover:text-[#121212]" })}>
                  {s.short}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-border bg-card">
        <p className="mx-auto max-w-7xl px-4 py-4 text-center text-xs uppercase tracking-[0.18em] text-muted-foreground sm:px-6 lg:px-8">
          Cash on delivery · Free delivery over ₹1,499 · Size guide on every outfit
        </p>
      </div>

      <div className="pt-16">
        {SECTIONS.map((s) => (
          <FestiveSection key={s.id} section={s} />
        ))}
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-8 text-center sm:px-6 lg:px-8">
        <Link to="/women?subcategory=Ethnic+Wear,Kurtas" className={buttonVariants({ size: "lg", className: "hover:bg-sale" })} data-testid="festive-shop-all">
          Shop all ethnic wear
        </Link>
      </section>
    </div>
  );
}
