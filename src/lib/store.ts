// LocalStorage-backed wishlist + bookings store with subscription
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Flight, Hotel } from "./mock-api";

export type WishlistItem =
  | { kind: "hotel"; id: string; data: Hotel; addedAt: number }
  | { kind: "flight"; id: string; data: Flight; addedAt: number };

export type Booking = {
  id: string;
  kind: "hotel" | "flight";
  data: Hotel | Flight;
  guestName: string;
  email: string;
  checkIn?: string;
  checkOut?: string;
  travelDate?: string;
  total: number;
  createdAt: number;
};

const WISHLIST_KEY = "tripplanner.wishlist";
const BOOKINGS_KEY = "tripplanner.bookings";

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]");
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

export const wishlistStore = {
  getAll: () => read<WishlistItem>(WISHLIST_KEY),
  has: (id: string) => read<WishlistItem>(WISHLIST_KEY).some((i) => i.id === id),
  toggleHotel: (hotel: Hotel) => {
    const items = read<WishlistItem>(WISHLIST_KEY);
    const exists = items.find((i) => i.id === hotel.id);
    if (exists) write(WISHLIST_KEY, items.filter((i) => i.id !== hotel.id));
    else write(WISHLIST_KEY, [...items, { kind: "hotel", id: hotel.id, data: hotel, addedAt: Date.now() }]);
  },
  toggleFlight: (flight: Flight) => {
    const items = read<WishlistItem>(WISHLIST_KEY);
    const exists = items.find((i) => i.id === flight.id);
    if (exists) write(WISHLIST_KEY, items.filter((i) => i.id !== flight.id));
    else write(WISHLIST_KEY, [...items, { kind: "flight", id: flight.id, data: flight, addedAt: Date.now() }]);
  },
  remove: (id: string) => write(WISHLIST_KEY, read<WishlistItem>(WISHLIST_KEY).filter((i) => i.id !== id)),
};

export const bookingsStore = {
  getAll: () => read<Booking>(BOOKINGS_KEY),
  add: (b: Omit<Booking, "id" | "createdAt">) => {
    const booking: Booking = { ...b, id: `BK-${Date.now()}`, createdAt: Date.now() };
    write(BOOKINGS_KEY, [booking, ...read<Booking>(BOOKINGS_KEY)]);
    return booking;
  },
  remove: (id: string) => write(BOOKINGS_KEY, read<Booking>(BOOKINGS_KEY).filter((b) => b.id !== id)),
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = () => cb();
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

export function useWishlist() {
  // SSR-safe via useState mount flag
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const items = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(wishlistStore.getAll()),
    () => "[]",
  );
  return mounted ? (JSON.parse(items) as WishlistItem[]) : [];
}

export function useBookings() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const items = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(bookingsStore.getAll()),
    () => "[]",
  );
  return mounted ? (JSON.parse(items) as Booking[]) : [];
}

export function useIsWishlisted(id: string) {
  const items = useWishlist();
  return items.some((i) => i.id === id);
}
