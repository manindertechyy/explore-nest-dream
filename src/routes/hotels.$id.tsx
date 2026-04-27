import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { Star, MapPin, Check } from "lucide-react";
import { getHotel } from "@/lib/mock-api";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/wishlist-button";
import { HotelsMap } from "@/components/hotels-map";

const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const inFour = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);

const searchSchema = z.object({
  checkIn: z.string().default(tomorrow),
  checkOut: z.string().default(inFour),
});

export const Route = createFileRoute("/hotels/$id")({
  validateSearch: zodValidator(searchSchema),
  loader: async ({ params }) => {
    const hotel = await getHotel(params.id);
    if (!hotel) throw notFound();
    return hotel;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — Voyago` : "Hotel — Voyago" },
      { name: "description", content: loaderData?.description ?? "Hotel details" },
      ...(loaderData ? [{ property: "og:image", content: loaderData.image }] : []),
    ],
  }),
  component: HotelDetail,
  errorComponent: ({ error }) => <div className="p-10 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <p>Hotel not found.</p>
      <Link to="/hotels" search={{ city: "Bali", checkIn: tomorrow, checkOut: inFour }} className="text-primary underline">Back to hotels</Link>
    </div>
  ),
});

function HotelDetail() {
  const hotel = Route.useLoaderData();
  const search = Route.useSearch();
  const nights = Math.max(1, Math.round((new Date(search.checkOut).getTime() - new Date(search.checkIn).getTime()) / 86400000));
  const total = hotel.pricePerNight * nights;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <Link to="/hotels" search={{ city: hotel.city, checkIn: search.checkIn, checkOut: search.checkOut }} className="text-sm text-muted-foreground hover:text-foreground">← Back to results</Link>

      <div className="mt-4 overflow-hidden rounded-3xl">
        <img src={hotel.image} alt={hotel.name} className="h-[420px] w-full object-cover" />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{hotel.city}, {hotel.country}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{hotel.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-base font-bold text-primary">
              <Star className="h-4 w-4 fill-current" /> {hotel.rating}
            </div>
            <span className="text-sm text-muted-foreground">{hotel.reviews} verified reviews</span>
          </div>
          <p className="mt-6 text-lg leading-relaxed text-foreground/80">{hotel.description}</p>

          <h2 className="mt-10 text-2xl font-bold">Amenities</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {hotel.amenities.map((a: string) => (
              <div key={a} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                <Check className="h-4 w-4 text-primary" /> <span className="text-sm">{a}</span>
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-2xl font-bold">Location</h2>
          <div className="mt-4 h-[360px]">
            <HotelsMap hotels={[hotel]} center={[hotel.lat, hotel.lng]} className="h-full w-full overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-soft)]" />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <p className="text-3xl font-bold text-primary">${hotel.pricePerNight}<span className="text-base font-normal text-muted-foreground">/night</span></p>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <Row label="Check-in" value={new Date(search.checkIn).toLocaleDateString()} />
              <Row label="Check-out" value={new Date(search.checkOut).toLocaleDateString()} />
              <Row label="Nights" value={String(nights)} />
              <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-bold">
                <span>Total</span><span>${total}</span>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button asChild className="flex-1 bg-coral hover:bg-coral/90 text-white">
                <Link to="/booking/hotel/$id" params={{ id: hotel.id }} search={{ checkIn: search.checkIn, checkOut: search.checkOut }}>Reserve</Link>
              </Button>
              <WishlistButton item={{ kind: "hotel", data: hotel }} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span><span className="text-foreground">{value}</span>
    </div>
  );
}
