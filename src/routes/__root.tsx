import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BUSINESS_NAME, CONTACT_EMAIL, CONTACT_MAILTO } from "../lib/contact";

import { AgeGate } from "../components/AgeGate";
import { PaymentTestModeBanner } from "../components/PaymentTestModeBanner";
import { NotificationBell } from "../components/NotificationBell";
import { ReferralWatcher } from "../components/ReferralWatcher";

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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ready Too Mingle — Local personal ads" },
      { name: "description", content: "Local personal ads for hookups, dating, casual encounters and activity partners." },
      { property: "og:title", content: "Ready Too Mingle — Local personal ads" },
      { property: "og:description", content: "Local personal ads for hookups, dating, casual encounters and activity partners." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,500&family=Manrope:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png?v=3" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
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
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <PaymentTestModeBanner />
        <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:py-4">
            <Link to="/" className="min-w-0 whitespace-nowrap text-lg font-bold sm:text-2xl" style={{ fontFamily: "var(--font-display)" }}>
              Ready Too <span className="text-shine italic">Mingle</span>
            </Link>
            <nav className="flex shrink-0 items-center gap-2 text-sm sm:gap-4">
              <Link to="/pricing" className="hidden text-muted-foreground hover:text-foreground sm:inline">Pricing</Link>
              <Link to="/faq" className="hidden text-muted-foreground hover:text-foreground sm:inline">FAQ</Link>
              <NotificationBell />
              <Link to="/post" className="whitespace-nowrap rounded-full bg-gradient-primary px-3 py-1.5 font-semibold text-primary-foreground sm:px-4 sm:py-2">Post an ad</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="border-t">
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-4 py-8 text-sm text-muted-foreground">
            <div className="space-y-1">
              <p>© {new Date().getFullYear()} {BUSINESS_NAME} · 18+ only</p>
              <p><a href={CONTACT_MAILTO} className="hover:text-foreground">{CONTACT_EMAIL}</a></p>
            </div>
            <div className="flex gap-4">

              <Link to="/pricing">Pricing</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
            </div>
          </div>
        </footer>
        <AgeGate />
        <ReferralWatcher />
      </div>
    </QueryClientProvider>
  );
}
