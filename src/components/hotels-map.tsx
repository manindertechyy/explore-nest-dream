import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Hotel } from "@/lib/mock-api";

// Fix default marker icons (leaflet needs absolute URLs)
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Props = {
  hotels: Hotel[];
  center?: [number, number];
  className?: string;
};

export function HotelsMap({ hotels, center, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const initial: [number, number] = center ?? (hotels[0] ? [hotels[0].lat, hotels[0].lng] : [20, 0]);
    const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(initial, hotels.length ? 12 : 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (!hotels.length) return;
    const bounds: L.LatLngTuple[] = [];
    hotels.forEach((h) => {
      const marker = L.marker([h.lat, h.lng], { icon: defaultIcon }).bindPopup(
        `<div style="min-width:180px"><strong>${h.name}</strong><br/>★ ${h.rating} · $${h.pricePerNight}/night<br/><em>${h.city}, ${h.country}</em></div>`,
      );
      marker.addTo(layer);
      bounds.push([h.lat, h.lng]);
    });
    if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40] });
    else map.setView(bounds[0], 13);
  }, [hotels]);

  return <div ref={containerRef} className={className ?? "h-[500px] w-full rounded-xl border border-border shadow-[var(--shadow-soft)]"} />;
}
