import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store/store";
import { track } from "@/lib/events";
import { formatINR } from "@/lib/format";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { RatingStars } from "@/components/RatingStars";
import { COLOR_HEX } from "@/lib/catalog";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const navigate = useNavigate();
  const [previewColor, setPreviewColor] = useState<string | null>(null);
  const wished = inWishlist(product.id);
  const outOfStock = product.stock <= 0;
  const colorImage = previewColor ? product.color_images?.[previewColor] : undefined;
  const leadImage = colorImage ?? product.images[0] ?? "";
  const hoverImage = !colorImage && product.images.length > 1 && product.images[1] !== leadImage ? product.images[1] : null;

  const quickAdd = (size: string | null) => {
    if (outOfStock) return;
    addToCart({
      product_id: product.id,
      size: size ?? (product.sizes.length === 1 ? product.sizes[0] : null),
      color: previewColor ?? product.colors[0] ?? null,
      quantity: 1,
    });
    track("add_to_cart", { productId: product.id });
    toast.success(`${product.name} added to your bag`);
  };

  const onQuickAddClick = () => {
    // Size is a required selection when the product has multiple sizes.
    if (product.sizes.length > 1) {
      navigate(`/product/${product.id}`);
      return;
    }
    quickAdd(null);
  };

  return (
    <article className="group relative flex flex-col" data-testid={`product-card-${product.sku}`}>
      <div className="relative overflow-hidden bg-[#F3EFEA]">
        <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`} className="block">
          <div className="relative aspect-[3/4] w-full">
            <ImageWithFallback
              key={leadImage}
              src={leadImage}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            {hoverImage && (
              <ImageWithFallback
                src={hoverImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </div>
        </Link>

        {/* badges */}
        <div className="pointer-events-none absolute left-0 top-3 flex flex-col items-start gap-1.5">
          {product.discount_percent > 0 && (
            <span className="bg-sale px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
              {product.discount_percent}% off
            </span>
          )}
          {outOfStock && (
            <span className="bg-foreground px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-background">
              Out of stock
            </span>
          )}
        </div>

        {/* wishlist */}
        <button
          type="button"
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          data-testid={`product-card-wishlist-${product.sku}`}
          onClick={() => {
            toggleWishlist(product.id);
            if (!wished) track("wishlist_add", { productId: product.id });
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition hover:scale-110"
        >
          <Heart size={16} className={wished ? "fill-sale text-sale" : ""} />
        </button>

        {/* quick add overlay (desktop hover) */}
        {!outOfStock && (
          <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-white/95 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block">
            {product.sizes.length > 1 ? (
              <div>
                <p className="mb-2 text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Quick add — select size
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      data-testid={`product-card-quick-add-size-${s}-${product.sku}`}
                      onClick={() => quickAdd(s)}
                      className="border border-foreground px-2.5 py-1 font-mono text-xs transition hover:bg-foreground hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                type="button"
                data-testid={`product-card-quick-add-${product.sku}`}
                onClick={onQuickAddClick}
                className="w-full bg-foreground py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-sale"
              >
                Add to bag
              </button>
            )}
          </div>
        )}

        {/* mobile quick add */}
        {!outOfStock && (
          <button
            type="button"
            aria-label={`Add ${product.name} to bag`}
            data-testid={`product-card-mobile-add-${product.sku}`}
            onClick={onQuickAddClick}
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground shadow-md transition hover:bg-foreground hover:text-white md:hidden"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <Link
          to={`/product/${product.id}`}
          className="line-clamp-2 h-10 text-sm font-medium leading-snug transition-colors hover:text-sale"
          title={product.name}
        >
          {product.name}
        </Link>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground truncate">
          {product.subcategory}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-semibold text-foreground" data-testid={`product-card-price-${product.sku}`}>
            {formatINR(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="font-mono text-xs text-muted-foreground line-through">
              {formatINR(product.original_price)}
            </span>
          )}
          {product.discount_percent > 0 && (
            <span className="text-[11px] font-bold uppercase tracking-tight text-sale">
              {product.discount_percent}% OFF
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 border-t border-border/40 pt-1.5">
          <RatingStars rating={product.rating} count={product.rating_count} />
          <span className="flex items-center gap-1">
            {product.colors.slice(0, 4).map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                aria-label={`Preview ${product.name} in ${c}`}
                aria-pressed={(previewColor ?? product.colors[0]) === c}
                data-testid={`product-card-color-${c.replace(/\s/g, "-").toLowerCase()}-${product.sku}`}
                onClick={() => setPreviewColor(c)}
                onMouseEnter={() => setPreviewColor(c)}
                className={`h-3.5 w-3.5 rounded-full border transition-transform hover:scale-125 ${
                  (previewColor ?? product.colors[0]) === c ? "border-foreground ring-1 ring-foreground ring-offset-1" : "border-border"
                }`}
                style={{ backgroundColor: COLOR_HEX[c] ?? "#D6D1CA" }}
              />
            ))}
          </span>
        </div>
      </div>
    </article>
  );
}
