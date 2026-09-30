import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./theme";
import ConfirmModal from "../ui/ConfirmModal";
import IconButton from "../ui/IconButton";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { isSuperAdminSession, readRefreshToken, clearAdminSession, sessionTimeLeft } from "../../lib/session";
import { logout } from "../../services/authApi";

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
  {
    label: "Bank Soal",
    to: "/admin/exams",
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
        <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H17a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6.5A1.5 1.5 0 0 1 5 19.5Z" />
        <path d="M5 16.5h14" />
        <path d="M9 7.5h6M9 11h4" />
      </svg>
    ),
  },
  {
    label: "Bank Materi",
    to: "/admin/materials",
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
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 18.5Z" />
        <path d="M8 3v18" />
        <path d="M12 8h5M12 12h5" />
      </svg>
    ),
  },
  {
    label: "Cara Pakai",
    to: "/admin/docs",
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
        <circle cx="12" cy="12" r="9" />
        <path d="M9.6 9.2a2.5 2.5 0 1 1 3.2 2.4c-.5.2-.8.7-.8 1.2v.7" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
  {
    label: "Kelola Admin",
    to: "/admin/admins",
    end: false,
    /* Hanya superadmin. Disembunyikan, bukan dikunci: halaman "/admin/admins"
       juga dijaga SuperAdminRoute, dan API-nya menolak dengan 403. */
    superAdminOnly: true,
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
        <circle cx="9" cy="8" r="3.5" />
        <path d="M3 20a6 6 0 0 1 12 0" />
        <path d="M18 5.5a3 3 0 0 1 0 5.9" />
        <path d="M17.5 14.5A5.5 5.5 0 0 1 21 20" />
      </svg>
    ),
  },
];

/** Item ber-role superadmin disembunyikan dari sidebar untuk admin biasa. */
interface NavProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Nav({ mobileOpen, onMobileClose }: NavProps) {
  const [open, setOpen] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const navigate = useNavigate();

  /** Sama dengan breakpoint `md` Tailwind: 767px ke bawah = tampilan HP. */
  const [mobileViewport, setMobileViewport] = useState(() =>
    window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");

    function onChange(event: MediaQueryListEvent) {
      setMobileViewport(event.matches);
    }

    query.addEventListener("change", onChange);

    return () => query.removeEventListener("change", onChange);
  }, []);

  // Laci menu di HP menutupi halaman, jadi scroll di belakangnya ikut dikunci
  // — tapi hanya di layar HP: di desktop sidebar tetap tampil dan halaman
  // normal-normal saja. Syarat `mobileViewport` mencegah halaman terkunci
  // kalau layar diperbesar ke ukuran desktop saat laci masih terbuka.
  useBodyScrollLock(mobileOpen && mobileViewport);

  const visibleNavigation = navigation.filter(
    (item) => !item.superAdminOnly || isSuperAdminSession()
  );

  // Hitung mundur akses token, dihitung ulang tiap 30 detik — cukup untuk
  // angka "menit tersisa" dan tidak membebani layar. Sesi sendiri
  // diperpanjang diam-diam oleh interceptor, jadi angka ini hanya
  // penanda, bukan sesuatu yang perlu dipantau administrator.
  const [timeLeft, setTimeLeft] = useState(() => sessionTimeLeft());

  useEffect(() => {
    const timer = window.setInterval(
      () => setTimeLeft(sessionTimeLeft()),
      30_000
    );

    return () => window.clearInterval(timer);
  }, []);

  const minutesLeft = Math.ceil(timeLeft / 60_000);

  /**
   * Keluar dicatat di server dulu (refresh token dicabut) sebelum storage
   * lokal dibersihkan, supaya sesi ini benar-benar mati dan tidak bisa
   * diperpanjang dari perangkat ini. Kalau server tidak terjangkau,
   * pengguna tetap keluar — token yang tertinggal di localStorage sudah
   * tidak ada di peramban dan tidak akan terkirim lagi.
   */
  async function handleLogout() {
    const refreshToken = readRefreshToken();

    clearAdminSession();
    onMobileClose();
    navigate("/login", { replace: true });

    if (refreshToken) {
      await logout(refreshToken).catch(() => undefined);
    }
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
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
                src="/Logo.webp"
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
          {visibleNavigation.map((item) => (
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

        {open && minutesLeft > 0 && (
          <p
            className="mt-3 px-3 text-[11px] text-fg-subtle"
            title="Akses otomatis diperpanjang selama Anda aktif"
          >
            Sesi aktif &middot; {minutesLeft} menit tersisa
          </p>
        )}

        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
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

      {/* Keluar itu tindakan yang mengganggu kalau tidak sengaja tersentuh,
          jadi selalu dikonfirmasi dulu. */}
      <ConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Yakin keluar dari admin?"
        confirmLabel="Iya, Keluar"
        cancelLabel="Tetap di Sini"
      />
    </>
  );
}
