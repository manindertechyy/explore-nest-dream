import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsWishlisted, wishlistStore } from "@/lib/store";
import type { Flight, Hotel } from "@/lib/mock-api";
import { toast } from "sonner";

type Props = {
  item: { kind: "hotel"; data: Hotel } | { kind: "flight"; data: Flight };
  className?: string;
};

export function WishlistButton({ item, className }: Props) {
  const id = item.kind === "hotel" ? item.data.id : item.data.id;
  const active = useIsWishlisted(id);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.kind === "hotel") wishlistStore.toggleHotel(item.data);
    else wishlistStore.toggleFlight(item.data);
    toast(active ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <button
      onClick={onClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/95 backdrop-blur transition-all hover:scale-110 hover:border-coral",
        className,
      )}
    >
      <Heart className={cn("h-5 w-5 transition-colors", active ? "fill-coral text-coral" : "text-foreground/60")} />
    </button>
  );
}
