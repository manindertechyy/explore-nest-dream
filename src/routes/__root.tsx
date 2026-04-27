import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Voyago — Plan Your Perfect Trip" },
      { name: "description", content: "Search flights, book hotels, explore destinations on the map and save trips to your wishlist." },
      { property: "og:title", content: "Voyago — Plan Your Perfect Trip" },
      { property: "og:description", content: "Search flights, book hotels, explore destinations on the map and save trips to your wishlist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Voyago — Plan Your Perfect Trip" },
      { name: "twitter:description", content: "Search flights, book hotels, explore destinations on the map and save trips to your wishlist." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/506202be-a515-4c06-a83c-f5435be448a1" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/506202be-a515-4c06-a83c-f5435be448a1" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/60 bg-card py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground md:flex-row md:gap-3 md:px-8">
          <span>© {new Date().getFullYear()} Voyago — Wander wisely.</span>
          <span className="hidden md:inline">·</span>
          <span className="inline-flex items-center gap-1.5">
            Created and Designed by
            <span className="font-medium text-foreground">Maninder Singh</span>
            <span aria-label="love" className="text-red-500">❤</span>
          </span>
        </div>
      </footer>
      <Toaster position="top-center" />
    </div>
  );
}
