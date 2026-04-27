import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
import { Hotel as HotelIcon, Check } from "lucide-react";
import { getHotel } from "@/lib/mock-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { bookingsStore } from "@/lib/store";
import { sendMockConfirmationEmail } from "@/lib/mock-email";
import { toast } from "sonner";

const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const inFour = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);

const searchSchema = z.object({
  checkIn: z.string().default(tomorrow),
  checkOut: z.string().default(inFour),
});

export const Route = createFileRoute("/booking/hotel/$id")({
  validateSearch: zodValidator(searchSchema),
  loader: async ({ params }) => {
    const hotel = await getHotel(params.id);
    if (!hotel) throw notFound();
    return hotel;
  },
  head: () => ({ meta: [{ title: "Confirm booking — Voyago" }] }),
  component: BookHotel,
  errorComponent: ({ error }) => <div className="p-10 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Hotel not found.</div>,
});

function BookHotel() {
  const hotel = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const nights = Math.max(1, Math.round((new Date(search.checkOut).getTime() - new Date(search.checkIn).getTime()) / 86400000));
  const total = hotel.pricePerNight * nights;

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return toast.error("Please fill in your details");
    const booking = bookingsStore.add({
      kind: "hotel",
      data: hotel,
      guestName: name,
      email,
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      total,
    });
    toast.success("Booking confirmed!");
    sendMockConfirmationEmail(booking).catch(() => {});
    navigate({ to: "/bookings", search: { confirmed: booking.id } });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Confirm your stay</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_360px]">
        <form onSubmit={onConfirm} className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Guest details</h2>
          <Field label="Full name"><Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" /></Field>
          <Field label="Email"><Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" /></Field>
          <h2 className="pt-4 text-xl font-semibold">Payment (mock)</h2>
          <Field label="Card number"><Input value="4242 4242 4242 4242" readOnly /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry"><Input value="12/29" readOnly /></Field>
            <Field label="CVC"><Input value="123" readOnly /></Field>
          </div>
          <Button type="submit" size="lg" className="w-full bg-coral hover:bg-coral/90 text-white">
            <Check className="mr-2 h-5 w-5" /> Confirm booking · ${total}
          </Button>
        </form>

        <aside className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <img src={hotel.image} alt={hotel.name} className="h-40 w-full rounded-xl object-cover" />
          <h3 className="mt-4 flex items-center gap-2 text-lg font-semibold"><HotelIcon className="h-5 w-5 text-primary" />{hotel.name}</h3>
          <p className="text-sm text-muted-foreground">{hotel.city}, {hotel.country}</p>
          <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <Row label="Check-in" value={new Date(search.checkIn).toLocaleDateString()} />
            <Row label="Check-out" value={new Date(search.checkOut).toLocaleDateString()} />
            <Row label="Nights" value={String(nights)} />
            <Row label={`$${hotel.pricePerNight} × ${nights}`} value={`$${total}`} />
            <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-bold">
              <span>Total</span><span>${total}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            <Link to="/hotels/$id" params={{ id: hotel.id }} search={{ checkIn: search.checkIn, checkOut: search.checkOut }} className="hover:text-foreground">← Back to hotel</Link>
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-muted-foreground"><span>{label}</span><span className="text-foreground">{value}</span></div>;
}
