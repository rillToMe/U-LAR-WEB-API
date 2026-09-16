import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ThemeProvider } from "../components/common/theme";
import Nav from "../components/common/Nav";
import IconButton from "../components/ui/IconButton";

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-surface-muted max-md:min-h-dvh">
        <Nav
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        <main className="flex-1 p-8 max-md:min-w-0 max-md:p-4">
          <IconButton
            variant="secondary"
            size="lg"
            onClick={() => setMobileNavOpen(true)}
            className="mb-4 text-fg md:hidden"
            label="Buka menu"
            aria-expanded={mobileNavOpen}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              className="size-5"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </IconButton>
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
}
