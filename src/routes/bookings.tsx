import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { CheckCircle2, Plane, Hotel as HotelIcon, Calendar, Trash2, Sparkles } from "lucide-react";
import { useBookings, bookingsStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import type { Hotel, Flight } from "@/lib/mock-api";

const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

const searchSchema = z.object({ confirmed: z.string().optional() });

export const Route = createFileRoute("/bookings")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Your bookings — Voyago" }] }),
  component: BookingsPage,
});

function BookingsPage() {
  const bookings = useBookings();
  const { confirmed } = Route.useSearch();
  const justBooked = bookings.find((b) => b.id === confirmed);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      {justBooked && (
        <div className="mb-8 flex items-start gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-primary" />
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold"><Sparkles className="h-5 w-5 text-coral" /> Booking confirmed!</h2>
            <p className="mt-1 text-sm text-muted-foreground">Confirmation #{justBooked.id} · A receipt was sent to {justBooked.email}.</p>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold md:text-5xl">Your bookings</h1>
      <p className="mt-2 text-muted-foreground">{bookings.length} {bookings.length === 1 ? "trip" : "trips"} planned</p>

      {bookings.length === 0 ? (
        <div className="mt-16 rounded-3xl border-2 border-dashed border-border bg-card p-16 text-center">
          <Calendar className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-2xl font-bold">No trips yet</h2>
          <p className="mt-2 text-muted-foreground">Book a flight or hotel to start planning your adventure.</p>
          <Button asChild className="mt-6 bg-coral hover:bg-coral/90 text-white"><Link to="/flights" search={{ from: "New York", to: "Paris", date: tomorrow }}>Find a flight</Link></Button>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((b) => {
            const isHotel = b.kind === "hotel";
            const hotel = isHotel ? (b.data as Hotel) : null;
            const flight = !isHotel ? (b.data as Flight) : null;
            return (
              <div key={b.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-5 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    {isHotel ? <HotelIcon className="h-4 w-4" /> : <Plane className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{isHotel ? "Hotel stay" : "Flight"}</p>
                    <p className="text-sm font-semibold">{b.id}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => bookingsStore.remove(b.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  {hotel && (
                    <div className="flex items-center gap-4">
                      <img src={hotel.image} alt="" className="h-20 w-28 rounded-lg object-cover" />
                      <div>
                        <h3 className="text-lg font-semibold">{hotel.name}</h3>
                        <p className="text-sm text-muted-foreground">{hotel.city}, {hotel.country}</p>
                        <p className="mt-1 text-sm">{new Date(b.checkIn!).toLocaleDateString()} → {new Date(b.checkOut!).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  {flight && (
                    <div>
                      <h3 className="text-lg font-semibold">{flight.airline} · {flight.flightNumber}</h3>
                      <p className="text-sm text-muted-foreground">{flight.from} ({flight.fromCode}) → {flight.to} ({flight.toCode})</p>
                      <p className="mt-1 text-sm">{new Date(b.travelDate!).toLocaleDateString()} · {flight.departTime} → {flight.arriveTime}</p>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Guest</p>
                    <p className="font-semibold">{b.guestName}</p>
                    <p className="mt-2 text-2xl font-bold text-primary">${b.total}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
