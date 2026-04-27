import { Link } from "@tanstack/react-router";
import { Plane, Heart, Compass, Hotel, Calendar } from "lucide-react";
import { useWishlist } from "@/lib/store";

export function SiteHeader() {
  const wishlist = useWishlist();
  const linkBase = "flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors";
  const activeProps = { className: "!text-primary font-semibold" };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--gradient-ocean)] shadow-[var(--shadow-glow)]">
            <Compass className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-semibold tracking-tight">Voyago</span>
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
