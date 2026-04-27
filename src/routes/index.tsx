import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plane, Hotel, MapPin, Search, ArrowRight, Sparkles, Heart, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POPULAR_CITIES } from "@/lib/mock-api";
import heroImage from "@/assets/hero-beach.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voyago — Plan flights, hotels & dream trips" },
      { name: "description", content: "Search mock flights and hotels, explore destinations on the map, save favorites to your wishlist and book in seconds." },
      { property: "og:title", content: "Voyago — Plan flights, hotels & dream trips" },
      { property: "og:image", content: heroImage },
      { name: "twitter:image", content: heroImage },
    ],
  }),
  component: HomePage,
});

const DESTINATIONS = [
  { city: "Bali", tag: "Tropical escape", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80&auto=format&fit=crop" },
  { city: "Tokyo", tag: "Neon nights", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80&auto=format&fit=crop" },
  { city: "Paris", tag: "Romance & art", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80&auto=format&fit=crop" },
  { city: "Reykjavik", tag: "Auroras & glaciers", img: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800&q=80&auto=format&fit=crop" },
  { city: "Cape Town", tag: "Wild coastlines", img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80&auto=format&fit=crop" },
  { city: "Dubai", tag: "Modern luxury", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80&auto=format&fit=crop" },
];

function HomePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"flights" | "hotels">("flights");
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const [from, setFrom] = useState("New York");
  const [to, setTo] = useState("Paris");
  const [date, setDate] = useState(tomorrow);

  const [city, setCity] = useState("Bali");
  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10));

  const onSearch = () => {
    if (tab === "flights") navigate({ to: "/flights", search: { from, to, date } });
    else navigate({ to: "/hotels", search: { city, checkIn, checkOut } });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img src={heroImage} alt="Aerial view of a tropical lagoon" width={1920} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-32 pt-24 md:px-8 md:pb-40 md:pt-32">
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Your next trip starts here
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
              Plan a journey<br />you'll never forget.
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/80 md:text-lg">
              Search flights, book stays, explore on the map and save your favorite trips — all in one elegant planner.
            </p>
          </div>

          {/* Search card */}
          <div className="relative mt-10 rounded-3xl bg-card/95 p-2 shadow-2xl backdrop-blur-xl md:mt-14">
            <div className="flex gap-1 border-b border-border px-4 pt-3">
              <button onClick={() => setTab("flights")} className={`flex items-center gap-2 rounded-t-lg px-5 py-3 text-sm font-semibold transition-colors ${tab === "flights" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Plane className="h-4 w-4" /> Flights
              </button>
              <button onClick={() => setTab("hotels")} className={`flex items-center gap-2 rounded-t-lg px-5 py-3 text-sm font-semibold transition-colors ${tab === "hotels" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Hotel className="h-4 w-4" /> Hotels
              </button>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
              {tab === "flights" ? (
                <>
                  <Field label="From"><Input list="cities" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Departure city" /></Field>
                  <Field label="To"><Input list="cities" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Destination" /></Field>
                  <Field label="Departure"><Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
                </>
              ) : (
                <>
                  <Field label="Destination"><Input list="cities" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Where to?" /></Field>
                  <Field label="Check-in"><Input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></Field>
                  <Field label="Check-out"><Input type="date" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></Field>
                </>
              )}
              <datalist id="cities">{POPULAR_CITIES.map((c) => <option key={c} value={c} />)}</datalist>
              <Button onClick={onSearch} size="lg" className="h-auto self-end bg-coral text-white hover:bg-coral/90">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending destinations */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-coral">Trending now</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Where everyone's going.</h2>
          </div>
          <Link to="/hotels" search={{ city: "Bali", checkIn: tomorrow, checkOut: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10) }} className="hidden text-sm font-medium text-primary hover:underline md:inline-flex md:items-center md:gap-1">
            Explore all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {DESTINATIONS.map((d, idx) => (
            <Link
              key={d.city}
              to="/hotels"
              search={{ city: d.city, checkIn: tomorrow, checkOut: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10) }}
              className={`group relative overflow-hidden rounded-2xl shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1 ${idx === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
            >
              <img src={d.img} alt={d.city} loading="lazy" className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${idx === 0 ? "h-[420px]" : "h-64"}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs font-medium uppercase tracking-wider opacity-90">{d.tag}</p>
                <p className={`mt-1 font-bold ${idx === 0 ? "text-4xl" : "text-2xl"}`}>{d.city}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/40 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">Everything you need to wander.</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              { icon: Plane, title: "Smart flight search", body: "Compare fares across airlines instantly." },
              { icon: Hotel, title: "Curated stays", body: "Hand-picked hotels for every budget." },
              { icon: MapPin, title: "Live maps", body: "See exactly where you'll stay before you book." },
              { icon: Heart, title: "Wishlist & plan", body: "Save dream trips and book when you're ready." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="overflow-hidden rounded-3xl bg-[var(--gradient-ocean)] p-10 text-primary-foreground md:p-16">
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <Globe2 className="h-4 w-4" /> Built for explorers
          </div>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">Your dream itinerary, one click away.</h2>
          <p className="mt-4 max-w-xl opacity-90">Mock APIs let you experiment freely — search, book, save, and review without spending a cent.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90"><Link to="/flights" search={{ from: "New York", to: "Tokyo", date: tomorrow }}>Search flights</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10"><Link to="/hotels" search={{ city: "Bali", checkIn: tomorrow, checkOut: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10) }}>Browse hotels</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
