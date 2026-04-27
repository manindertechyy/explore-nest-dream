import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Plane, Trash2, MapPin, Star, Scale, X, Check, Minus } from "lucide-react";
import { useWishlist, wishlistStore, type WishlistItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const inFour = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Your wishlist — Voyago" }, { name: "description", content: "Trips and stays you've saved." }] }),
  component: WishlistPage,
});

function WishlistPage() {
  const items = useWishlist();
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"hotel" | "flight">("hotel");

  const hotels = useMemo(() => items.filter((i): i is Extract<WishlistItem, { kind: "hotel" }> => i.kind === "hotel"), [items]);
  const flights = useMemo(() => items.filter((i): i is Extract<WishlistItem, { kind: "flight" }> => i.kind === "flight"), [items]);

  const toggleSel = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  };

  const activeList = tab === "hotel" ? hotels : flights;
  const selectedItems = activeList.filter((i) => selected.has(i.id));
  const canCompare = compareMode && selectedItems.length >= 2;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold md:text-5xl">Your wishlist</h1>
          <p className="mt-2 text-muted-foreground">{items.length} saved {items.length === 1 ? "item" : "items"}</p>
        </div>
        {items.length > 0 && (
          <Button
            variant={compareMode ? "default" : "outline"}
            onClick={() => { setCompareMode((v) => !v); setSelected(new Set()); }}
            className={compareMode ? "bg-primary" : ""}
          >
            {compareMode ? <X className="mr-1.5 h-4 w-4" /> : <Scale className="mr-1.5 h-4 w-4" />}
            {compareMode ? "Exit compare" : "Compare"}
          </Button>
        )}
      </div>

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
        <>
          {compareMode && (
            <Tabs value={tab} onValueChange={(v) => { setTab(v as "hotel" | "flight"); setSelected(new Set()); }} className="mt-6">
              <TabsList>
                <TabsTrigger value="hotel">Hotels ({hotels.length})</TabsTrigger>
                <TabsTrigger value="flight">Flights ({flights.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="hotel" className="mt-4">
                <p className="text-sm text-muted-foreground">Select 2–4 hotels to compare side-by-side.</p>
              </TabsContent>
              <TabsContent value="flight" className="mt-4">
                <p className="text-sm text-muted-foreground">Select 2–4 flights to compare side-by-side.</p>
              </TabsContent>
            </Tabs>
          )}

          {canCompare && (
            <div className="mt-6">
              {tab === "hotel" ? (
                <HotelCompareTable items={selectedItems as Extract<WishlistItem, { kind: "hotel" }>[]} />
              ) : (
                <FlightCompareTable items={selectedItems as Extract<WishlistItem, { kind: "flight" }>[]} />
              )}
            </div>
          )}

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {(compareMode ? (tab === "hotel" ? hotels : flights) : items).map((it) => {
              const isSel = selected.has(it.id);
              return it.kind === "hotel" ? (
                <div
                  key={it.id}
                  className={`group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition ${
                    compareMode ? (isSel ? "border-primary ring-2 ring-primary/30" : "border-border cursor-pointer hover:border-primary/50") : "border-border"
                  }`}
                  onClick={compareMode ? () => toggleSel(it.id) : undefined}
                >
                  {compareMode && (
                    <div className="absolute left-3 top-3 z-10 rounded-md bg-background/90 p-1.5 backdrop-blur">
                      <Checkbox checked={isSel} />
                    </div>
                  )}
                  <div className="relative h-48"><img src={it.data.image} alt={it.data.name} loading="lazy" className="h-full w-full object-cover" /></div>
                  <div className="p-5">
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{it.data.city}, {it.data.country}</p>
                    <h3 className="mt-1 text-lg font-semibold">{it.data.name}</h3>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 fill-primary text-primary" /> {it.data.rating}
                      <span className="ml-auto text-xl font-bold text-primary">${it.data.pricePerNight}<span className="text-sm font-normal text-muted-foreground">/night</span></span>
                    </div>
                    {!compareMode && (
                      <div className="mt-4 flex gap-2">
                        <Button asChild className="flex-1 bg-coral hover:bg-coral/90 text-white"><Link to="/hotels/$id" params={{ id: it.data.id }} search={{ checkIn: tomorrow, checkOut: inFour }}>View</Link></Button>
                        <Button variant="outline" size="icon" onClick={() => wishlistStore.remove(it.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  key={it.id}
                  className={`relative rounded-2xl border bg-card p-5 shadow-sm transition ${
                    compareMode ? (isSel ? "border-primary ring-2 ring-primary/30" : "border-border cursor-pointer hover:border-primary/50") : "border-border"
                  }`}
                  onClick={compareMode ? () => toggleSel(it.id) : undefined}
                >
                  {compareMode && (
                    <div className="absolute left-3 top-3 z-10 rounded-md bg-background p-1.5">
                      <Checkbox checked={isSel} />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Plane className="h-6 w-6" /></div>
                    <div>
                      <p className="font-semibold">{it.data.airline} · {it.data.flightNumber}</p>
                      <p className="text-xs text-muted-foreground">{it.data.from} → {it.data.to} · {it.data.duration}</p>
                    </div>
                    <p className="ml-auto text-xl font-bold text-primary">${it.data.price}</p>
                  </div>
                  {!compareMode && (
                    <div className="mt-4 flex gap-2">
                      <Button asChild className="flex-1 bg-coral hover:bg-coral/90 text-white"><Link to="/booking/flight/$id" params={{ id: it.data.id }} search={{ from: it.data.from, to: it.data.to, date: tomorrow }}>Book</Link></Button>
                      <Button variant="outline" size="icon" onClick={() => wishlistStore.remove(it.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function HotelCompareTable({ items }: { items: Extract<WishlistItem, { kind: "hotel" }>[] }) {
  const allAmenities = Array.from(new Set(items.flatMap((i) => i.data.amenities)));
  const prices = items.map((i) => i.data.pricePerNight);
  const minPrice = Math.min(...prices);
  const maxRating = Math.max(...items.map((i) => i.data.rating));

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-border">
            <th className="w-36 bg-secondary/50 p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compare</th>
            {items.map((i) => (
              <th key={i.id} className="p-4 text-left">
                <img src={i.data.image} alt="" className="h-24 w-full rounded-lg object-cover" />
                <p className="mt-2 text-sm font-bold">{i.data.name}</p>
                <p className="text-xs text-muted-foreground">{i.data.city}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          <CompareRow label="Price / night">
            {items.map((i) => (
              <td key={i.id} className="p-4">
                <span className={`text-lg font-bold ${i.data.pricePerNight === minPrice ? "text-primary" : "text-foreground"}`}>
                  ${i.data.pricePerNight}
                </span>
                {i.data.pricePerNight === minPrice && <Badge>Best price</Badge>}
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Rating">
            {items.map((i) => (
              <td key={i.id} className="p-4">
                <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{i.data.rating}</span>
                <span className="ml-1 text-xs text-muted-foreground">({i.data.reviews})</span>
                {i.data.rating === maxRating && <Badge>Top rated</Badge>}
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Location">
            {items.map((i) => <td key={i.id} className="p-4">{i.data.city}, {i.data.country}</td>)}
          </CompareRow>
          {allAmenities.map((a) => (
            <CompareRow key={a} label={a}>
              {items.map((i) => (
                <td key={i.id} className="p-4">
                  {i.data.amenities.includes(a)
                    ? <Check className="h-4 w-4 text-primary" />
                    : <Minus className="h-4 w-4 text-muted-foreground/40" />}
                </td>
              ))}
            </CompareRow>
          ))}
          <tr>
            <td className="bg-secondary/50 p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</td>
            {items.map((i) => (
              <td key={i.id} className="p-4">
                <Button asChild size="sm" className="bg-coral hover:bg-coral/90 text-white">
                  <Link to="/hotels/$id" params={{ id: i.data.id }} search={{ checkIn: tomorrow, checkOut: inFour }}>View</Link>
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function FlightCompareTable({ items }: { items: Extract<WishlistItem, { kind: "flight" }>[] }) {
  const prices = items.map((i) => i.data.price);
  const minPrice = Math.min(...prices);
  const minStops = Math.min(...items.map((i) => i.data.stops));

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-border">
            <th className="w-36 bg-secondary/50 p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compare</th>
            {items.map((i) => (
              <th key={i.id} className="p-4 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Plane className="h-6 w-6" /></div>
                <p className="mt-2 text-sm font-bold">{i.data.airline}</p>
                <p className="text-xs text-muted-foreground">{i.data.flightNumber}</p>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          <CompareRow label="Price">
            {items.map((i) => (
              <td key={i.id} className="p-4">
                <span className={`text-lg font-bold ${i.data.price === minPrice ? "text-primary" : "text-foreground"}`}>${i.data.price}</span>
                {i.data.price === minPrice && <Badge>Cheapest</Badge>}
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Route">
            {items.map((i) => <td key={i.id} className="p-4">{i.data.fromCode} → {i.data.toCode}</td>)}
          </CompareRow>
          <CompareRow label="Depart / Arrive">
            {items.map((i) => <td key={i.id} className="p-4">{i.data.departTime} → {i.data.arriveTime}</td>)}
          </CompareRow>
          <CompareRow label="Duration">
            {items.map((i) => <td key={i.id} className="p-4">{i.data.duration}</td>)}
          </CompareRow>
          <CompareRow label="Stops">
            {items.map((i) => (
              <td key={i.id} className="p-4">
                {i.data.stops === 0 ? "Nonstop" : `${i.data.stops} stop`}
                {i.data.stops === minStops && <Badge>Fewest stops</Badge>}
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Cabin">
            {items.map((i) => <td key={i.id} className="p-4">{i.data.cabin}</td>)}
          </CompareRow>
          <tr>
            <td className="bg-secondary/50 p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</td>
            {items.map((i) => (
              <td key={i.id} className="p-4">
                <Button asChild size="sm" className="bg-coral hover:bg-coral/90 text-white">
                  <Link to="/booking/flight/$id" params={{ id: i.data.id }} search={{ from: i.data.from, to: i.data.to, date: tomorrow }}>Book</Link>
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="bg-secondary/50 p-4 align-top text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</td>
      {children}
    </tr>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">{children}</span>;
}

// keep reference so type import stays used
type _Unused = Hotel | Flight;
