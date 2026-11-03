import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COLOR_HEX } from "@/lib/catalog";

export interface FilterState {
  subcategory: string[];
  min_price?: number;
  max_price?: number;
  size?: string;
  color?: string;
  in_stock: boolean;
}

export const EMPTY_FILTERS: FilterState = { subcategory: [], in_stock: false };

export function FilterPanel({
  subcategories,
  state,
  onChange,
  resultCount,
}: {
  subcategories: string[];
  state: FilterState;
  onChange: (next: FilterState) => void;
  resultCount: number;
}) {
  const [minInput, setMinInput] = useState(state.min_price?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(state.max_price?.toString() ?? "");

  const toggleSubcategory = (sub: string) => {
    const next = state.subcategory.includes(sub)
      ? state.subcategory.filter((s) => s !== sub)
      : [...state.subcategory, sub];
    onChange({ ...state, subcategory: next });
  };

  const applyPrice = () => {
    const min = parseInt(minInput, 10);
    const max = parseInt(maxInput, 10);
    onChange({
      ...state,
      min_price: Number.isFinite(min) ? min : undefined,
      max_price: Number.isFinite(max) ? max : undefined,
    });
  };

  const isPristine =
    state.subcategory.length === 0 &&
    state.min_price === undefined &&
    state.max_price === undefined &&
    !state.size &&
    !state.color &&
    !state.in_stock;

  return (
    <div className="space-y-8" data-testid="filter-panel">
      <div className="flex items-center justify-between">
        <p className="overline-label">Filters</p>
        <Button
          variant="ghost"
          size="xs"
          disabled={isPristine}
          data-testid="filter-clear-button"
          onClick={() => {
            setMinInput("");
            setMaxInput("");
            onChange(EMPTY_FILTERS);
          }}
        >
          Clear all
        </Button>
      </div>

      {subcategories.length > 0 && (
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em]">Category</p>
          <div className="space-y-2.5">
            {subcategories.map((sub) => (
              <label key={sub} className="flex cursor-pointer items-center gap-2.5 text-sm" data-testid={`filter-subcategory-${sub.replace(/\s/g, "-").toLowerCase()}`}>
                <Checkbox
                  checked={state.subcategory.includes(sub)}
                  onCheckedChange={() => toggleSubcategory(sub)}
                />
                {sub}
              </label>
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em]">Price (₹)</p>
        <div className="flex items-center gap-2">
          <div>
            <Label htmlFor="filter-min-price" className="sr-only">Minimum price</Label>
            <Input
              id="filter-min-price"
              inputMode="numeric"
              placeholder="Min"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value.replace(/\D/g, ""))}
              className="h-9 w-full"
              data-testid="filter-min-price-input"
            />
          </div>
          <span className="text-muted-foreground">–</span>
          <div>
            <Label htmlFor="filter-max-price" className="sr-only">Maximum price</Label>
            <Input
              id="filter-max-price"
              inputMode="numeric"
              placeholder="Max"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value.replace(/\D/g, ""))}
              className="h-9 w-full"
              data-testid="filter-max-price-input"
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={applyPrice} data-testid="filter-price-apply-button">
            Go
          </Button>
        </div>
      </section>

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em]">Size</p>
        <div className="flex flex-wrap gap-1.5">
          {["XS", "S", "M", "L", "XL", "XXL", "UK7", "UK8", "UK9", "4-5Y", "6-7Y", "Pack of 2", "Pack of 3", "Pack of 6", "Set of 5", "Set of 7", "Set of 8", "Set of 21", "12 Inch", "14 Inch", "Standard", "One Size"].map((s) => (
            <button
              key={s}
              type="button"
              data-testid={`filter-size-${s}`}
              onClick={() => onChange({ ...state, size: state.size === s ? undefined : s })}
              className={`border px-2.5 py-1 font-mono text-xs transition ${
                state.size === s
                  ? "border-foreground bg-foreground text-white"
                  : "border-border hover:border-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em]">Colour</p>
        <div className="flex flex-wrap gap-2">
          {["Brass / Gold", "Antique Brass", "Gold", "Terracotta", "Marigold Yellow", "Red", "Maroon", "Black", "White", "Beige", "Navy", "Blue", "Pink", "Green", "Olive", "Yellow", "Teal", "Copper", "Multi"].map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              aria-label={`Filter by colour ${c}`}
              aria-pressed={state.color === c}
              data-testid={`filter-color-${c.replace(/\s/g, "-").toLowerCase()}`}
              onClick={() => onChange({ ...state, color: state.color === c ? undefined : c })}
              className={`h-7 w-7 rounded-full border-2 transition ${
                state.color === c ? "border-foreground ring-1 ring-foreground ring-offset-1" : "border-border"
              }`}
              style={{ backgroundColor: COLOR_HEX[c] ?? "#D6D1CA" }}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2.5 border-t border-border pt-6">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox
            checked={state.in_stock}
            onCheckedChange={(checked) => onChange({ ...state, in_stock: checked === true })}
          />
          In stock only
        </label>
        <p className="text-xs text-muted-foreground" data-testid="filter-result-count">
          {resultCount} product{resultCount === 1 ? "" : "s"} match
        </p>
      </section>
    </div>
  );
}
