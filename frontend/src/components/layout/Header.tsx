import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Heart, LayoutGrid, LogOut, Menu, Package, MapPin, Search, ShoppingBag, User, UserRound, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useMe, useLogin } from "@/hooks/useAuth";
import { useStore } from "@/store/store";
import { endSession } from "@/lib/session";

const NAV_LINKS = [
  { to: "/", label: "Home", testId: "nav-home" },
  { to: "/men", label: "Men", testId: "nav-men" },
  { to: "/women", label: "Women", testId: "nav-women" },
  { to: "/kids", label: "Kids", testId: "nav-kids" },
  { to: "/home-essentials", label: "Home Essentials", testId: "nav-home-essentials" },
  { to: "/new-arrivals", label: "New Arrivals", testId: "nav-new-arrivals" },
  { to: "/festive", label: "Festive", testId: "nav-festive" },
  { to: "/sale", label: "Sale", testId: "nav-sale" },
];

export function Header() {
  const { cartCount, wishlist } = useStore();
  const { data: user } = useMe();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = searchTerm.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSignOut = async () => {
    await endSession();
    toast.success("Signed out. See you soon.");
    navigate("/");
  };

  // A signed-out visitor arriving from /login lands here with no session — nothing to do.
  void login;

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-9 items-center justify-center bg-[#121212] px-4">
        <p className="text-center text-[11px] uppercase tracking-[0.2em] text-[#E5DFD7]">
          Free delivery over ₹1,499 · Cash on Delivery available
        </p>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        {/* mobile menu */}
        <div className="flex items-center gap-1 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" data-testid="mobile-menu-button" />}>
              <Menu size={20} />
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b border-border p-5">
                <SheetTitle>
                  <span className="font-heading text-2xl tracking-tight">
                    Salesphere<span className="text-sale">.</span>
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-4" aria-label="Mobile">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    data-testid={`mobile-${l.testId}`}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-3 text-sm uppercase tracking-[0.14em] ${isActive(l.to) ? "text-sale" : ""}`}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="my-3 border-t border-border" />
                <Link to="/account" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-sm uppercase tracking-[0.14em]">
                  My Account
                </Link>
                <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="px-3 py-3 text-sm uppercase tracking-[0.14em]">
                  Wishlist ({wishlist.length})
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          {/* mobile search */}
          <Button variant="ghost" size="icon" aria-label="Search products" data-testid="mobile-search-button" onClick={() => setSearchOpen(true)}>
            <Search size={20} />
          </Button>
        </div>

        {/* wordmark */}
        <Link to="/" className="flex items-baseline" aria-label="Salesphere home" data-testid="header-logo">
          <span className="font-heading text-2xl font-medium tracking-tight lg:text-3xl">
            Salesphere<span className="text-sale">.</span>
          </span>
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={l.testId}
              className={({ isActive: active }) =>
                `relative py-2 text-[13px] font-medium uppercase tracking-[0.14em] transition-colors hover:text-sale ${
                  active ? "text-sale" : ""
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* actions */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            data-testid="header-search-button"
            className="hidden lg:inline-flex"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={19} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Account" data-testid="header-account-button" />}>
              <UserRound size={19} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user ? (
                <>
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-medium" data-testid="account-dropdown-name">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="account-dropdown-profile" onClick={() => navigate("/account")}>
                    <User size={15} /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="account-dropdown-orders" onClick={() => navigate("/account/orders")}>
                    <Package size={15} /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="account-dropdown-addresses" onClick={() => navigate("/account/addresses")}>
                    <MapPin size={15} /> Addresses
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="account-dropdown-signout" onClick={handleSignOut}>
                    <LogOut size={15} /> Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 text-xs text-muted-foreground">Welcome to Salesphere</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="account-dropdown-signin" onClick={() => navigate("/login")}>
                    <User size={15} /> Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="account-dropdown-register" onClick={() => navigate("/register")}>
                    <LayoutGrid size={15} /> Create Account
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/wishlist"
            aria-label="Wishlist"
            data-testid="header-wishlist-button"
            className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}
          >
            <Heart size={19} />
            {wishlist.length > 0 && (
              <span
                data-testid="header-wishlist-count"
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 font-mono text-[10px] font-semibold text-white"
              >
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            aria-label="Shopping bag"
            data-testid="header-cart-button"
            className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}
          >
            <ShoppingBag size={19} />
            {cartCount > 0 && (
              <span
                data-testid="header-cart-count"
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 font-mono text-[10px] font-semibold text-white"
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* search dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Search Salesphere</DialogTitle>
            <DialogDescription>Find products by name, colour, category or SKU.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSearch} role="search">
            <div className="flex gap-2">
              <Input
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Try “kurta”, “denim jeans”, “sneakers”…"
                aria-label="Search products"
                data-testid="search-input"
              />
              <Button type="submit" data-testid="search-submit-button">
                Search
              </Button>
            </div>
          </form>
          <div className="flex flex-wrap gap-2">
            <span className="mr-1 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">Trending:</span>
            {["Kurta", "Dresses", "Denim", "Sneakers", "Saree", "Trench"].map((t) => (
              <button
                key={t}
                type="button"
                data-testid={`search-suggestion-${t.toLowerCase()}`}
                onClick={() => {
                  setSearchOpen(false);
                  navigate(`/search?q=${encodeURIComponent(t)}`);
                }}
                className="border border-border px-3 py-1 text-xs transition hover:border-foreground hover:bg-foreground hover:text-white"
              >
                {t}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
