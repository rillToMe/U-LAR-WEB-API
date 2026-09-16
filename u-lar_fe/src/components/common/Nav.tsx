import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./theme";
import IconButton from "../ui/IconButton";

const navigation = [
  {
    label: "Dashboard",
    to: "/admin",
    end: true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-5"
      >
        <rect width="7" height="9" x="3" y="3" rx="1.5" />
        <rect width="7" height="5" x="14" y="3" rx="1.5" />
        <rect width="7" height="9" x="14" y="12" rx="1.5" />
        <rect width="7" height="5" x="3" y="16" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Mahasiswa",
    to: "/admin/students",
    end: false,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-5"
      >
        <path d="m3 10 9-5 9 5-9 5-9-5Z" />
        <path d="M7 12.5v4.25C7 18 9.24 19 12 19s5-1 5-2.25V12.5" />
        <path d="M21 10v6" />
      </svg>
    ),
  },
];

interface NavProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Nav({ mobileOpen, onMobileClose }: NavProps) {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    onMobileClose();
    navigate("/login", { replace: true });
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-fg/40 md:hidden"
        />
      )}
      <aside
        aria-label="Menu admin"
        className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width,background-color,border-color] duration-300 ease-out motion-reduce:transition-none max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:h-dvh max-md:w-[min(16rem,calc(100vw-3rem))] max-md:transition-transform ${
          open ? "w-64" : "w-[76px]"
        } ${
          mobileOpen
            ? "max-md:visible max-md:translate-x-0"
            : "max-md:pointer-events-none max-md:invisible max-md:-translate-x-full"
        }`}
      >
        <div
          className={`flex h-20 items-center border-b border-border px-4 transition-colors duration-300 motion-reduce:transition-none max-md:justify-between ${
            open ? "justify-between" : "justify-center"
          }`}
        >
          <div className={`flex min-w-0 items-center gap-3 ${open ? "" : "md:hidden"}`}>
            <div className="size-10 shrink-0 overflow-hidden rounded-lg">
              <img
                src="/Logo2.png"
                alt="U-LAR"
                className="h-[77px] w-10 max-w-none -translate-y-[17px] object-contain"
              />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-base font-bold text-fg">U-LAR</p>
              <p className="truncate text-xs font-medium text-fg-subtle">
                Admin Panel
              </p>
            </div>
          </div>

          <IconButton
            size="lg"
            onClick={onMobileClose}
            label="Tutup menu"
            className="md:hidden"
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

          <IconButton
            variant="secondary"
            onClick={() => setOpen((current) => !current)}
            label={open ? "Ciutkan menu" : "Perluas menu"}
            aria-expanded={open}
            title={open ? "Ciutkan menu" : "Perluas menu"}
            className="max-md:hidden"
          >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`size-4 transition-transform duration-300 ${
              open ? "" : "rotate-180"
            }`}
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          </IconButton>
      </div>

      <nav
        className="flex-1 px-3 py-6 max-md:min-h-0 max-md:overflow-y-auto"
        aria-label="Navigasi utama"
      >
        {open && (
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-fg-placeholder max-md:hidden">
            Menu Utama
          </p>
        )}

        <div className="space-y-1.5">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onMobileClose}
              title={open ? undefined : item.label}
              className={({ isActive }) =>
                `group relative flex h-11 items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  open
                    ? "gap-3 px-3"
                    : "justify-center px-0 max-md:justify-start max-md:gap-3 max-md:px-3"
                } ${
                  isActive
                    ? "bg-accent-surface text-accent-hover"
                    : "text-fg-muted hover:bg-surface-hover hover:text-fg"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" />
                  )}
                  <span className="shrink-0">{item.icon}</span>
                  {open && <span>{item.label}</span>}
                  {!open && (
                    <span className="sr-only max-md:not-sr-only">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <div
          className={`flex items-center rounded-lg bg-surface-muted p-2 ${
            open ? "justify-between" : "justify-center max-md:justify-between"
          }`}
        >
          {open && (
            <div className="min-w-0 pl-1">
              <p className="text-xs font-semibold text-fg">Tampilan</p>
              <p className="text-[11px] text-fg-subtle">Ganti tema</p>
            </div>
          )}
          {!open && (
            <div className="hidden min-w-0 pl-1 max-md:block">
              <p className="text-xs font-semibold text-fg">Tampilan</p>
              <p className="text-[11px] text-fg-subtle">Ganti tema</p>
            </div>
          )}
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title={open ? "Keluar" : "Keluar"}
          className={`mt-3 flex h-11 w-full items-center rounded-lg text-sm font-medium text-fg-muted transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:bg-danger-surface hover:text-danger ${
            open
              ? "gap-3 px-3"
              : "justify-center px-0 max-md:justify-start max-md:gap-3 max-md:px-3"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-5 shrink-0"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          {open && <span>Keluar</span>}
          {!open && (
            <span className="sr-only max-md:not-sr-only">Keluar</span>
          )}
        </button>
      </div>
      </aside>
    </>
  );
}
