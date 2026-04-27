import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Star, MapPin, Search } from "lucide-react";
import { searchHotels, POPULAR_CITIES, type Hotel } from "@/lib/mock-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WishlistButton } from "@/components/wishlist-button";
import { HotelsMap } from "@/components/hotels-map";
import { useState } from "react";

const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const inFour = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);

const searchSchema = z.object({
  city: z.string().default("Bali"),
  checkIn: z.string().default(tomorrow),
  checkOut: z.string().default(inFour),
});

export const Route = createFileRoute("/hotels")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ city: search.city, checkIn: search.checkIn, checkOut: search.checkOut }),
  loader: ({ deps }) => searchHotels(deps.city, deps.checkIn, deps.checkOut),
  head: () => ({ meta: [{ title: "Hotels — Voyago" }, { name: "description", content: "Find and book stays worldwide." }] }),
  component: HotelsPage,
  errorComponent: ({ error }) => <div className="p-10 text-center text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">No hotels found.</div>,
  pendingComponent: () => <div className="p-10 text-center text-muted-foreground">Finding stays…</div>,
});

function HotelsPage() {
  const hotels = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [city, setCity] = useState(search.city);
  const [checkIn, setCheckIn] = useState(search.checkIn);
  const [checkOut, setCheckOut] = useState(search.checkOut);
  const nights = Math.max(1, Math.round((new Date(search.checkOut).getTime() - new Date(search.checkIn).getTime()) / 86400000));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <h1 className="text-4xl font-bold md:text-5xl">Stays in {search.city}</h1>
      <p className="mt-2 text-muted-foreground">{hotels.length} hotels · {nights} night{nights > 1 ? "s" : ""}</p>

      <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto]">
        <Input list="cities-h" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Destination" />
        <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        <datalist id="cities-h">{POPULAR_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
        <Button onClick={() => navigate({ to: "/hotels", search: { city, checkIn, checkOut } })} className="bg-primary"><Search className="mr-2 h-4 w-4" />Search</Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-5">
          {hotels.map((h: Hotel) => (
            <div key={h.id} className="group grid gap-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-[var(--shadow-soft)] md:grid-cols-[280px_1fr]">
              <div className="relative h-56 md:h-full">
                <img src={h.image} alt={h.name} loading="lazy" className="h-full w-full object-cover" />
                <WishlistButton item={{ kind: "hotel", data: h }} className="absolute right-3 top-3" />
              </div>
              <div className="flex flex-col gap-3 p-5">
                <div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{h.city}, {h.country}</p>
                  <h3 className="mt-1 text-xl font-semibold">{h.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-sm font-bold text-primary">
                    <Star className="h-3.5 w-3.5 fill-current" /> {h.rating}
                  </div>
                  <span className="text-sm text-muted-foreground">({h.reviews} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {h.amenities.slice(0, 4).map((a: string) => (
                    <span key={a} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">{a}</span>
                  ))}
                </div>
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-primary">${h.pricePerNight}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                    <p className="text-xs text-muted-foreground">${h.pricePerNight * nights} total</p>
                  </div>
                  <Button asChild className="bg-coral hover:bg-coral/90 text-white">
                    <Link to="/hotels/$id" params={{ id: h.id }} search={{ checkIn: search.checkIn, checkOut: search.checkOut }}>View deal</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Map view</h2>
          <HotelsMap hotels={hotels} className="h-[500px] w-full overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-soft)] lg:h-[calc(100%-2.5rem)]" />
        </aside>
      </div>
    </div>
  );
}
