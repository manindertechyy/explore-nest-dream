import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Plane, ArrowRight, Clock, Search } from "lucide-react";
import { searchFlights, POPULAR_CITIES, type Flight } from "@/lib/mock-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WishlistButton } from "@/components/wishlist-button";
import { useState } from "react";

const searchSchema = z.object({
  from: z.string().default("New York"),
  to: z.string().default("Paris"),
  date: z.string().default(new Date(Date.now() + 86400000).toISOString().slice(0, 10)),
});

export const Route = createFileRoute("/flights")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ from: search.from, to: search.to, date: search.date }),
  loader: ({ deps }) => searchFlights(deps.from, deps.to, deps.date),
  head: () => ({ meta: [{ title: "Flights — Voyago" }, { name: "description", content: "Search and compare flights." }] }),
  component: FlightsPage,
  errorComponent: ({ error }) => <div className="p-10 text-center text-destructive">Couldn't load flights: {error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">No flights found.</div>,
  pendingComponent: () => <div className="p-10 text-center text-muted-foreground">Searching the skies…</div>,
});

function FlightsPage() {
  const flights = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [from, setFrom] = useState(search.from);
  const [to, setTo] = useState(search.to);
  const [date, setDate] = useState(search.date);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <h1 className="text-4xl font-bold md:text-5xl">Find your flight</h1>
      <p className="mt-2 text-muted-foreground">{flights.length} options from {search.from} to {search.to}</p>

      <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto]">
        <Input list="cities-fl" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From" />
        <Input list="cities-fl" value={to} onChange={(e) => setTo(e.target.value)} placeholder="To" />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <datalist id="cities-fl">{POPULAR_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
        <Button onClick={() => navigate({ to: "/flights", search: { from, to, date } })} className="bg-primary"><Search className="mr-2 h-4 w-4" />Search</Button>
      </div>

      <div className="mt-8 space-y-4">
        {flights.map((f: Flight) => (
          <div key={f.id} className="group relative grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-[var(--shadow-soft)] md:grid-cols-[auto_1fr_auto_auto] md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">{f.airline}</p>
                <p className="text-xs text-muted-foreground">{f.flightNumber} · {f.cabin}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{f.departTime}</p>
                <p className="text-xs text-muted-foreground">{f.fromCode}</p>
              </div>
              <div className="flex-1">
                <div className="relative h-px bg-border">
                  <ArrowRight className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {f.duration} · {f.stops === 0 ? "Nonstop" : `${f.stops} stop`}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{f.arriveTime}</p>
                <p className="text-xs text-muted-foreground">{f.toCode}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-primary">${f.price}</p>
              <p className="text-xs text-muted-foreground">per traveler</p>
            </div>

            <div className="flex items-center gap-2">
              <WishlistButton item={{ kind: "flight", data: f }} />
              <Button asChild className="bg-coral hover:bg-coral/90 text-white">
                <Link to="/booking/flight/$id" params={{ id: f.id }} search={{ from: f.from, to: f.to, date: search.date }}>Book</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
