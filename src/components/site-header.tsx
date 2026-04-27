import { Link } from "@tanstack/react-router";
import { Plane, Heart, Hotel, Calendar } from "lucide-react";
import { useWishlist } from "@/lib/store";

function Logo() {
  // Minimalist mark: thin circle + paper-plane arrow — monoline, single color
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7 text-primary" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8.5 16.5 L22 9 L17.5 22 L15 17 L8.5 16.5 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
    </svg>
  );
}

export function SiteHeader() {
  const wishlist = useWishlist();
  const linkBase = "flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors";
  const activeProps = { className: "!text-primary font-semibold" };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <Logo />
          <div className="flex flex-col leading-none">
            <span className="text-lg font-semibold tracking-tight">Voyago</span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              wander wisely
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link to="/flights" className={linkBase} activeProps={activeProps}>
            <Plane className="h-4 w-4" /> Flights
          </Link>
          <Link to="/hotels" className={linkBase} activeProps={activeProps}>
            <Hotel className="h-4 w-4" /> Hotels
          </Link>
          <Link to="/bookings" className={linkBase} activeProps={activeProps}>
            <Calendar className="h-4 w-4" /> Bookings
          </Link>
        </nav>

        <Link to="/wishlist" className="relative flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-coral hover:text-coral transition-colors">
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Wishlist</span>
          {wishlist.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-coral text-[10px] font-bold text-white">
              {wishlist.length}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
