// Mock API for flights and hotels
export type Flight = {
  id: string;
  airline: string;
  flightNumber: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  price: number;
  cabin: string;
};

export type Hotel = {
  id: string;
  name: string;
  city: string;
  country: string;
  rating: number;
  reviews: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
  lat: number;
  lng: number;
  description: string;
};

const AIRLINES = ["SkyJet", "AeroLink", "OceanAir", "BlueWing", "Aurora", "Sunpath"];
const CITY_COORDS: Record<string, { code: string; lat: number; lng: number; country: string }> = {
  "Paris": { code: "CDG", lat: 48.8566, lng: 2.3522, country: "France" },
  "Tokyo": { code: "HND", lat: 35.6762, lng: 139.6503, country: "Japan" },
  "New York": { code: "JFK", lat: 40.7128, lng: -74.006, country: "USA" },
  "London": { code: "LHR", lat: 51.5074, lng: -0.1278, country: "UK" },
  "Bali": { code: "DPS", lat: -8.4095, lng: 115.1889, country: "Indonesia" },
  "Dubai": { code: "DXB", lat: 25.2048, lng: 55.2708, country: "UAE" },
  "Rome": { code: "FCO", lat: 41.9028, lng: 12.4964, country: "Italy" },
  "Barcelona": { code: "BCN", lat: 41.3851, lng: 2.1734, country: "Spain" },
  "Sydney": { code: "SYD", lat: -33.8688, lng: 151.2093, country: "Australia" },
  "Cape Town": { code: "CPT", lat: -33.9249, lng: 18.4241, country: "South Africa" },
  "Reykjavik": { code: "KEF", lat: 64.1466, lng: -21.9426, country: "Iceland" },
  "Bangkok": { code: "BKK", lat: 13.7563, lng: 100.5018, country: "Thailand" },
};

export const POPULAR_CITIES = Object.keys(CITY_COORDS);

function seedRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return () => {
    h = (h * 9301 + 49297) % 233280;
    return h / 233280;
  };
}

export async function searchFlights(from: string, to: string, date: string): Promise<Flight[]> {
  await new Promise((r) => setTimeout(r, 600));
  const fromInfo = CITY_COORDS[from] ?? { code: from.slice(0, 3).toUpperCase(), lat: 0, lng: 0, country: "" };
  const toInfo = CITY_COORDS[to] ?? { code: to.slice(0, 3).toUpperCase(), lat: 0, lng: 0, country: "" };
  const rand = seedRandom(`${from}-${to}-${date}`);
  const count = 6;
  return Array.from({ length: count }, (_, i) => {
    const airline = AIRLINES[Math.floor(rand() * AIRLINES.length)];
    const hour = 6 + Math.floor(rand() * 16);
    const dur = 2 + Math.floor(rand() * 12);
    const arriveH = (hour + dur) % 24;
    const stops = rand() > 0.6 ? 1 : 0;
    return {
      id: `FL-${from}-${to}-${i}`,
      airline,
      flightNumber: `${airline.slice(0, 2).toUpperCase()}${100 + Math.floor(rand() * 900)}`,
      from,
      fromCode: fromInfo.code,
      to,
      toCode: toInfo.code,
      departTime: `${String(hour).padStart(2, "0")}:${rand() > 0.5 ? "30" : "00"}`,
      arriveTime: `${String(arriveH).padStart(2, "0")}:${rand() > 0.5 ? "45" : "15"}`,
      duration: `${dur}h ${Math.floor(rand() * 59)}m`,
      stops,
      price: 120 + Math.floor(rand() * 880),
      cabin: rand() > 0.7 ? "Business" : "Economy",
    };
  }).sort((a, b) => a.price - b.price);
}

const HOTEL_NAMES = [
  "Grand Marina", "Azure Bay Resort", "The Parkside", "Sunset Boutique", "Skyline Tower",
  "Coastal Villa", "Heritage Court", "The Atrium", "Lighthouse Inn", "Velvet Suites",
];

const AMENITIES = ["Wi-Fi", "Pool", "Spa", "Gym", "Breakfast", "Parking", "Beach", "Bar"];

export async function searchHotels(city: string, checkIn: string, checkOut: string): Promise<Hotel[]> {
  await new Promise((r) => setTimeout(r, 600));
  const info = CITY_COORDS[city] ?? { code: "", lat: 0, lng: 0, country: "Unknown" };
  const rand = seedRandom(`${city}-${checkIn}-${checkOut}`);
  return HOTEL_NAMES.slice(0, 8).map((name, i) => {
    const amenityCount = 3 + Math.floor(rand() * 5);
    return {
      id: `HT-${city}-${i}`,
      name: `${name} ${city}`,
      city,
      country: info.country,
      rating: Math.round((3.5 + rand() * 1.5) * 10) / 10,
      reviews: 50 + Math.floor(rand() * 2000),
      pricePerNight: 80 + Math.floor(rand() * 520),
      image: `https://images.unsplash.com/photo-${[
        "1566073771259-6a8506099945",
        "1582719508461-905c673771fd",
        "1551882547-ff40c63fe5fa",
        "1564501049412-61c2a3083791",
        "1455587734955-081b22074882",
        "1571896349842-33c89424de2d",
        "1520250497591-112f2f40a3f4",
        "1542314831-068cd1dbfeeb",
      ][i]}?w=800&q=80&auto=format&fit=crop`,
      amenities: AMENITIES.slice(0, amenityCount),
      lat: info.lat + (rand() - 0.5) * 0.05,
      lng: info.lng + (rand() - 0.5) * 0.05,
      description: `A stunning property in the heart of ${city} offering unforgettable stays with world-class service.`,
    };
  });
}

export async function getHotel(id: string): Promise<Hotel | null> {
  const city = id.split("-")[1];
  if (!city) return null;
  const list = await searchHotels(city, "", "");
  return list.find((h) => h.id === id) ?? null;
}

export function getCityCoords(city: string) {
  return CITY_COORDS[city];
}
