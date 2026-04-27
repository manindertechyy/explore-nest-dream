import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Plane, Trash2, MapPin, Star } from "lucide-react";
import { useWishlist, wishlistStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const inFour = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Your wishlist — Voyago" }, { name: "description", content: "Trips and stays you've saved." }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const items = useWishlist();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-4xl font-bold md:text-5xl">Your wishlist</h1>
      <p className="mt-2 text-muted-foreground">{items.length} saved {items.length === 1 ? "item" : "items"}</p>

      {items.length === 0 ? (
        <div className="mt-16 rounded-3xl border-2 border-dashed border-border bg-card p-16 text-center">
          <Heart className="mx-auto h-12 w-12 text-coral" />
          <h2 className="mt-4 text-2xl font-bold">Nothing saved yet</h2>
          <p className="mt-2 text-muted-foreground">Tap the heart on any flight or hotel to save it for later.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild className="bg-primary"><Link to="/hotels" search={{ city: "Bali", checkIn: tomorrow, checkOut: inFour }}>Browse hotels</Link></Button>
            <Button asChild variant="outline"><Link to="/flights" search={{ from: "New York", to: "Tokyo", date: tomorrow }}>Search flights</Link></Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {items.map((it) => it.kind === "hotel" ? (
            <div key={it.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="relative h-48"><img src={it.data.image} alt={it.data.name} loading="lazy" className="h-full w-full object-cover" /></div>
              <div className="p-5">
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{it.data.city}, {it.data.country}</p>
                <h3 className="mt-1 text-lg font-semibold">{it.data.name}</h3>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-primary text-primary" /> {it.data.rating}
                  <span className="ml-auto text-xl font-bold text-primary">${it.data.pricePerNight}<span className="text-sm font-normal text-muted-foreground">/night</span></span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild className="flex-1 bg-coral hover:bg-coral/90 text-white"><Link to="/hotels/$id" params={{ id: it.data.id }} search={{ checkIn: tomorrow, checkOut: inFour }}>View</Link></Button>
                  <Button variant="outline" size="icon" onClick={() => wishlistStore.remove(it.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ) : (
            <div key={it.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Plane className="h-6 w-6" /></div>
                <div>
                  <p className="font-semibold">{it.data.airline} · {it.data.flightNumber}</p>
                  <p className="text-xs text-muted-foreground">{it.data.from} → {it.data.to} · {it.data.duration}</p>
                </div>
                <p className="ml-auto text-xl font-bold text-primary">${it.data.price}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button asChild className="flex-1 bg-coral hover:bg-coral/90 text-white"><Link to="/booking/flight/$id" params={{ id: it.data.id }} search={{ from: it.data.from, to: it.data.to, date: tomorrow }}>Book</Link></Button>
                <Button variant="outline" size="icon" onClick={() => wishlistStore.remove(it.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
