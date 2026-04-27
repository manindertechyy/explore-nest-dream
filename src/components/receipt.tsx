import { forwardRef } from "react";
import { Compass, Plane, Hotel as HotelIcon } from "lucide-react";
import type { Booking } from "@/lib/store";
import type { Hotel, Flight } from "@/lib/mock-api";

type Props = { booking: Booking };

export const Receipt = forwardRef<HTMLDivElement, Props>(function Receipt({ booking }, ref) {
  const isHotel = booking.kind === "hotel";
  const hotel = isHotel ? (booking.data as Hotel) : null;
  const flight = !isHotel ? (booking.data as Flight) : null;

  return (
    <div ref={ref} className="mx-auto max-w-2xl bg-white p-10 text-[#0f172a] print:p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-[#0f172a] pb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0891b2]">
            <Compass className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight">Voyago</p>
            <p className="text-xs text-slate-500">Travel receipt</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-slate-500">Confirmation</p>
          <p className="font-mono text-sm font-bold">{booking.id}</p>
          <p className="mt-1 text-xs text-slate-500">{new Date(booking.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Customer */}
      <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Billed to</p>
          <p className="mt-1 font-semibold">{booking.guestName}</p>
          <p className="text-slate-600">{booking.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Payment</p>
          <p className="mt-1 font-semibold">Visa •••• 4242</p>
          <p className="text-slate-600">Charged · USD</p>
        </div>
      </div>

      {/* Line item */}
      <div className="mt-8 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
          {isHotel ? <HotelIcon className="h-4 w-4" /> : <Plane className="h-4 w-4" />}
          {isHotel ? "Hotel reservation" : "Flight itinerary"}
        </div>
        <div className="p-5">
          {hotel && (
            <>
              <p className="text-lg font-bold">{hotel.name}</p>
              <p className="text-sm text-slate-600">{hotel.city}, {hotel.country}</p>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  <Row k="Check-in" v={new Date(booking.checkIn!).toLocaleDateString()} />
                  <Row k="Check-out" v={new Date(booking.checkOut!).toLocaleDateString()} />
                  <Row k="Nights" v={String(Math.max(1, Math.round((new Date(booking.checkOut!).getTime() - new Date(booking.checkIn!).getTime()) / 86400000)))} />
                  <Row k="Rate" v={`$${hotel.pricePerNight} / night`} />
                </tbody>
              </table>
            </>
          )}
          {flight && (
            <>
              <p className="text-lg font-bold">{flight.airline} · {flight.flightNumber}</p>
              <p className="text-sm text-slate-600">{flight.from} ({flight.fromCode}) → {flight.to} ({flight.toCode})</p>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  <Row k="Travel date" v={new Date(booking.travelDate!).toLocaleDateString()} />
                  <Row k="Depart" v={`${flight.departTime} · ${flight.fromCode}`} />
                  <Row k="Arrive" v={`${flight.arriveTime} · ${flight.toCode}`} />
                  <Row k="Duration" v={`${flight.duration} · ${flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`}`} />
                  <Row k="Cabin" v={flight.cabin} />
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* Totals */}
      <div className="mt-6 ml-auto w-full max-w-xs text-sm">
        <div className="flex justify-between py-1 text-slate-600"><span>Subtotal</span><span>${booking.total}</span></div>
        <div className="flex justify-between py-1 text-slate-600"><span>Taxes & fees</span><span>Included</span></div>
        <div className="mt-2 flex justify-between border-t-2 border-[#0f172a] pt-2 text-base font-bold">
          <span>Total paid</span><span>${booking.total}</span>
        </div>
      </div>

      <p className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
        Thank you for booking with Voyago · support@voyago.example · This is a mock receipt for demonstration.
      </p>
    </div>
  );
});

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-1.5 text-slate-500">{k}</td>
      <td className="py-1.5 text-right font-medium">{v}</td>
    </tr>
  );
}
