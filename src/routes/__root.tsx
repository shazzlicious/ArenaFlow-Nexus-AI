import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import "../lib/i18n";
import { ThemeSync } from "../components/ThemeSync";
import { FloatingAssistant } from "../components/FloatingAssistant";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#050914] px-4 text-white">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Node not found</h2>
        <p className="mt-2 text-sm text-white/60">
          This stadium node isn't on the digital twin.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold"
            style={{ background: "var(--team-gradient)", color: "var(--team-primary-contrast)" }}
          >
            Back to live ops
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#050914] px-4 text-white">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This view didn't load</h1>
        <p className="mt-2 text-sm text-white/60">
          A subsystem crashed. You can retry or return to the ops dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full px-4 py-2 text-sm font-semibold"
            style={{ background: "var(--team-gradient)", color: "var(--team-primary-contrast)" }}
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold"
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
      { title: "ArenaFlow Nexus — Live Stadium Digital Twin" },
      {
        name: "description",
        content:
          "AI-powered digital twin for FIFA World Cup 2026 stadiums — real-time crowd density, predictive alerts, and multilingual fan assistance.",
      },
      { name: "author", content: "ArenaFlow" },
      { property: "og:title", content: "ArenaFlow Nexus — Live Stadium Digital Twin" },
      {
        property: "og:description",
        content:
          "A living digital twin of the stadium that predicts problems before they happen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/arenaflownexusAI.png", type: "image/x-icon" },
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
      <ThemeSync />
      <Outlet />
      <FloatingAssistant />
      <Toaster theme="dark" position="top-right" richColors />
    </QueryClientProvider>
  );
}
