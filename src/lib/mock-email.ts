// Mock email service — "sends" by storing in localStorage and showing a toast
import { toast } from "sonner";
import type { Booking } from "./store";
import type { Hotel, Flight } from "./mock-api";

export type MockEmail = {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: number;
  bookingId: string;
};

const KEY = "tripplanner.emails";

function read(): MockEmail[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
function write(list: MockEmail[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export const emailStore = {
  getAll: () => read(),
  getForBooking: (bookingId: string) => read().find((e) => e.bookingId === bookingId),
};

export function formatBookingEmail(booking: Booking): { subject: string; body: string } {
  if (booking.kind === "hotel") {
    const h = booking.data as Hotel;
    const checkIn = new Date(booking.checkIn!).toLocaleDateString();
    const checkOut = new Date(booking.checkOut!).toLocaleDateString();
    return {
      subject: `✈️ Voyago booking confirmed — ${h.name}`,
      body: `Hi ${booking.guestName},

Your stay at ${h.name} in ${h.city}, ${h.country} is confirmed.

Confirmation #: ${booking.id}
Check-in:  ${checkIn}
Check-out: ${checkOut}
Total:     $${booking.total}

We can't wait to host you. Safe travels!
— The Voyago Team`,
    };
  }
  const f = booking.data as Flight;
  const date = new Date(booking.travelDate!).toLocaleDateString();
  return {
    subject: `✈️ Voyago flight confirmed — ${f.airline} ${f.flightNumber}`,
    body: `Hi ${booking.guestName},

Your flight is confirmed.

Confirmation #: ${booking.id}
Flight:   ${f.airline} ${f.flightNumber}
Route:    ${f.from} (${f.fromCode}) → ${f.to} (${f.toCode})
Date:     ${date}
Depart:   ${f.departTime}   Arrive: ${f.arriveTime}
Cabin:    ${f.cabin}
Total:    $${booking.total}

Have a wonderful trip!
— The Voyago Team`,
  };
}

export async function sendMockConfirmationEmail(booking: Booking): Promise<MockEmail> {
  // simulate network latency
  await new Promise((r) => setTimeout(r, 400));
  const { subject, body } = formatBookingEmail(booking);
  const email: MockEmail = {
    id: `EM-${Date.now()}`,
    to: booking.email,
    subject,
    body,
    sentAt: Date.now(),
    bookingId: booking.id,
  };
  write([email, ...read()]);
  toast.success("Confirmation email sent", {
    description: `Delivered to ${booking.email}`,
  });
  return email;
}
