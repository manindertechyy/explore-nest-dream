import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";
import { CheckCircle2, Plane, Hotel as HotelIcon, Calendar, Trash2, Sparkles, Receipt as ReceiptIcon, Printer, Mail } from "lucide-react";
import { useBookings, bookingsStore, type Booking } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Receipt } from "@/components/receipt";
import { emailStore, formatBookingEmail } from "@/lib/mock-email";
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
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);
  const [emailBooking, setEmailBooking] = useState<Booking | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => window.print();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      {justBooked && (
        <div className="no-print mb-8 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-primary" />
            <div className="flex-1">
              <h2 className="flex items-center gap-2 text-xl font-bold"><Sparkles className="h-5 w-5 text-coral" /> Booking confirmed!</h2>
              <p className="mt-1 text-sm text-muted-foreground">Confirmation #{justBooked.id} · A mock receipt was emailed to {justBooked.email}.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setReceiptBooking(justBooked)} className="bg-primary">
                  <ReceiptIcon className="mr-1.5 h-4 w-4" /> View receipt
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEmailBooking(justBooked)}>
                  <Mail className="mr-1.5 h-4 w-4" /> View email
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="no-print text-4xl font-bold md:text-5xl">Your bookings</h1>
      <p className="no-print mt-2 text-muted-foreground">{bookings.length} {bookings.length === 1 ? "trip" : "trips"} planned</p>

      {bookings.length === 0 ? (
        <div className="no-print mt-16 rounded-3xl border-2 border-dashed border-border bg-card p-16 text-center">
          <Calendar className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-2xl font-bold">No trips yet</h2>
          <p className="mt-2 text-muted-foreground">Book a flight or hotel to start planning your adventure.</p>
          <Button asChild className="mt-6 bg-coral hover:bg-coral/90 text-white"><Link to="/flights" search={{ from: "New York", to: "Paris", date: tomorrow }}>Find a flight</Link></Button>
        </div>
      ) : (
        <div className="no-print mt-8 space-y-4">
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
                  <Button variant="ghost" size="sm" onClick={() => setEmailBooking(b)} title="View confirmation email">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setReceiptBooking(b)} title="View receipt">
                    <ReceiptIcon className="h-4 w-4" />
                  </Button>
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

      {/* Receipt dialog */}
      <Dialog open={!!receiptBooking} onOpenChange={(o) => !o && setReceiptBooking(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sr-only"><DialogTitle>Receipt</DialogTitle></DialogHeader>
          {receiptBooking && (
            <div className="print-receipt">
              <Receipt ref={receiptRef} booking={receiptBooking} />
            </div>
          )}
          <DialogFooter className="no-print sticky bottom-0 flex-row justify-end gap-2 border-t border-border bg-background p-4">
            <Button variant="outline" onClick={() => setReceiptBooking(null)}>Close</Button>
            <Button onClick={handlePrint} className="bg-primary">
              <Printer className="mr-1.5 h-4 w-4" /> Print / Save PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email preview dialog */}
      <Dialog open={!!emailBooking} onOpenChange={(o) => !o && setEmailBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> Confirmation email</DialogTitle>
          </DialogHeader>
          {emailBooking && <EmailPreview booking={emailBooking} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmailPreview({ booking }: { booking: Booking }) {
  const saved = emailStore.getForBooking(booking.id);
  const { subject, body } = saved ? { subject: saved.subject, body: saved.body } : formatBookingEmail(booking);
  const sentAt = saved ? new Date(saved.sentAt) : new Date(booking.createdAt);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm">
        <div className="grid grid-cols-[80px_1fr] gap-y-1">
          <span className="text-muted-foreground">From</span><span>Voyago &lt;hello@voyago.example&gt;</span>
          <span className="text-muted-foreground">To</span><span>{booking.email}</span>
          <span className="text-muted-foreground">Date</span><span>{sentAt.toLocaleString()}</span>
          <span className="text-muted-foreground">Subject</span><span className="font-semibold">{subject}</span>
        </div>
      </div>
      <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-card p-5 font-sans text-sm leading-relaxed">
        {body}
      </pre>
      <p className="text-xs text-muted-foreground">This is a mock email — in production it would be delivered via your email provider.</p>
    </div>
  );
}
