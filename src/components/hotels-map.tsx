import { useEffect, useRef } from "react";
import type LType from "leaflet";
import type { Hotel } from "@/lib/mock-api";

const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

type Props = {
  hotels: Hotel[];
  center?: [number, number];
  className?: string;
};

export function HotelsMap({ hotels, center, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LType.Map | null>(null);
  const layerRef = useRef<LType.LayerGroup | null>(null);
  const LRef = useRef<typeof LType | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;
      const defaultIcon = L.icon({
        iconRetinaUrl, iconUrl, shadowUrl,
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
      });
      const initial: [number, number] = center ?? (hotels[0] ? [hotels[0].lat, hotels[0].lng] : [20, 0]);
      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(initial, hotels.length ? 12 : 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      const layer = L.layerGroup().addTo(map);
      layerRef.current = layer;
      mapRef.current = map;

      // initial render of markers
      const bounds: LType.LatLngTuple[] = [];
      hotels.forEach((h) => {
        L.marker([h.lat, h.lng], { icon: defaultIcon })
          .bindPopup(`<div style="min-width:180px"><strong>${h.name}</strong><br/>★ ${h.rating} · $${h.pricePerNight}/night<br/><em>${h.city}, ${h.country}</em></div>`)
          .addTo(layer);
        bounds.push([h.lat, h.lng]);
      });
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40] });
      else if (bounds.length === 1) map.setView(bounds[0], 13);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();
    if (!hotels.length) return;
    const defaultIcon = L.icon({
      iconRetinaUrl, iconUrl, shadowUrl,
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
    });
    const bounds: LType.LatLngTuple[] = [];
    hotels.forEach((h) => {
      L.marker([h.lat, h.lng], { icon: defaultIcon })
        .bindPopup(`<div style="min-width:180px"><strong>${h.name}</strong><br/>★ ${h.rating} · $${h.pricePerNight}/night<br/><em>${h.city}, ${h.country}</em></div>`)
        .addTo(layer);
      bounds.push([h.lat, h.lng]);
    });
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40] });
    else map.setView(bounds[0], 13);
  }, [hotels]);

  return <div ref={containerRef} className={className ?? "h-[500px] w-full rounded-xl border border-border shadow-[var(--shadow-soft)]"} />;
}
