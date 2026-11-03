import { Link } from "react-router-dom";
import { SiInstagram, SiX, SiYoutube } from "@icons-pack/react-simple-icons";
import { Mail } from "lucide-react";

const SHOP_LINKS = [
  { to: "/men", label: "Men" },
  { to: "/women", label: "Women" },
  { to: "/kids", label: "Kids" },
  { to: "/home-essentials", label: "Home Essentials" },
  { to: "/festive", label: "Festive Edit" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/sale", label: "Sale" },
];

const HELP_LINKS = [
  { to: "/pages/contact", label: "Contact Us" },
  { to: "/pages/shipping-returns", label: "Shipping & Returns" },
  { to: "/pages/privacy", label: "Privacy Policy" },
  { to: "/pages/about", label: "About Salesphere" },
  { to: "/manager/login", label: "Manager Portal" },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-[#121212] text-[#E5DFD7]" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-heading text-3xl tracking-tight text-white">
              Salesphere<span className="text-sale">.</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#B5AEA4]">
              Premium fashion for men, women and kids — curated collections, honest prices and cash
              on delivery across India.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Salesphere on Instagram" className="transition hover:text-sale">
                <SiInstagram size={18} />
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="Salesphere on X" className="transition hover:text-sale">
                <SiX size={18} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="Salesphere on YouTube" className="transition hover:text-sale">
                <SiYoutube size={18} />
              </a>
            </div>
          </div>

          <nav aria-label="Shop">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white">Shop</p>
            <ul className="mt-4 space-y-2.5">
              {SHOP_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-[#B5AEA4] transition hover:text-white" data-testid={`footer-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Help">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white">Customer Care</p>
            <ul className="mt-4 space-y-2.5">
              {HELP_LINKS.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-[#B5AEA4] transition hover:text-white" data-testid={`footer-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white">Talk to us</p>
            <a href="mailto:support@salesphere.in" className="mt-4 inline-flex items-center gap-2 text-sm text-[#B5AEA4] transition hover:text-white">
              <Mail size={15} /> support@salesphere.in
            </a>
            <p className="mt-2 text-sm text-[#B5AEA4]">Mon–Sat, 9 AM – 7 PM IST</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-[#2E2A27] pt-6 text-xs text-[#B5AEA4] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Salesphere. All rights reserved.</p>
          <p>DWM project prototype — sample catalogue data; orders are cash on delivery.</p>
        </div>
      </div>
    </footer>
  );
}
