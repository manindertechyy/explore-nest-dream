import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { useState } from "react";
import { Plane, Check, ArrowRight } from "lucide-react";
import { searchFlights } from "@/lib/mock-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { bookingsStore } from "@/lib/store";
import { sendMockConfirmationEmail } from "@/lib/mock-email";
import { toast } from "sonner";

const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

const searchSchema = z.object({
  from: z.string().default("New York"),
  to: z.string().default("Paris"),
  date: z.string().default(tomorrow),
});

export const Route = createFileRoute("/booking/flight/$id")({
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => ({ from: search.from, to: search.to, date: search.date }),
  loader: async ({ params, deps }) => {
    const flights = await searchFlights(deps.from, deps.to, deps.date);
    const flight = flights.find((f) => f.id === params.id);
    if (!flight) throw notFound();
    return flight;
  },
  head: () => ({ meta: [{ title: "Confirm flight — Voyago" }] }),
  component: BookFlight,
  errorComponent: ({ error }) => <div className="p-10 text-center text-destructive">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Flight not found.</div>,
});

function BookFlight() {
  const flight = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const total = flight.price;

  const onConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return toast.error("Please fill in your details");
    const booking = bookingsStore.add({
      kind: "flight",
      data: flight,
      guestName: name,
      email,
      travelDate: search.date,
      total,
    });
    toast.success("Flight booked!");
    sendMockConfirmationEmail(booking).catch(() => {});
    navigate({ to: "/bookings", search: { confirmed: booking.id } });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
      <h1 className="text-4xl font-bold md:text-5xl">Confirm your flight</h1>
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_360px]">
        <form onSubmit={onConfirm} className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Passenger details</h2>
          <Field label="Full name (as on ID)"><Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" /></Field>
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
          <div className="flex items-center gap-2"><Plane className="h-5 w-5 text-primary" /><span className="font-semibold">{flight.airline}</span><span className="text-xs text-muted-foreground">{flight.flightNumber}</span></div>
          <div className="mt-5 flex items-center justify-between">
            <div className="text-center">
              <p className="text-2xl font-bold">{flight.departTime}</p>
              <p className="text-xs text-muted-foreground">{flight.fromCode}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-center">
              <p className="text-2xl font-bold">{flight.arriveTime}</p>
              <p className="text-xs text-muted-foreground">{flight.toCode}</p>
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">{flight.duration} · {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`}</p>

          <div className="mt-5 space-y-1 border-t border-border pt-4 text-sm">
            <Row label="Travel date" value={new Date(search.date).toLocaleDateString()} />
            <Row label="Cabin" value={flight.cabin} />
            <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-bold">
              <span>Total</span><span>${total}</span>
            </div>
          </div>
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
