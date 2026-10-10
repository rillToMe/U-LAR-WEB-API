/* Set ikon garis halaman depan.
 *
 * Digambar tangan dengan gaya seragam (24x24, stroke membulat) sebagai
 * pengganti font Material Symbols, supaya halaman depan tidak bergantung
 * pada aset eksternal apa pun. */

const paths = {
  reticle: (
    <>
      <path d="M4 9V6a2 2 0 0 1 2-2h3" />
      <path d="M15 4h3a2 2 0 0 1 2 2v3" />
      <path d="M20 15v3a2 2 0 0 1-2 2h-3" />
      <path d="M9 20H6a2 2 0 0 1-2-2v-3" />
      <circle cx="12" cy="12" r="1.6" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  "chevron-down": <path d="m6 9.5 6 6 6-6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  person: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  inventory: (
    <>
      <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
      <path d="M3.5 7.5 12 12l8.5-4.5" />
      <path d="M12 12v9" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M4 4l16 16" />
      <path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c2.9 0 5.4 1.3 7.3 3" />
      <path d="M6.6 6.6C4.9 7.8 3.5 9.7 3 12c.6 2.7 3.7 6 9 6 1.4 0 2.7-.3 3.9-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M12 10v3.5l2.5 1.5" />
      <path d="M9.5 2.5h5" />
    </>
  ),
  ar: (
    <>
      <path d="M12 3.5 4.5 7.5v9L12 20.5l7.5-4v-9z" />
      <path d="M4.5 7.5 12 11.5l7.5-4" />
      <path d="M12 11.5v9" />
    </>
  ),
  tune: (
    <>
      <path d="M7 4v6" />
      <path d="M7 14v6" />
      <path d="M12 4v2" />
      <path d="M12 10v10" />
      <path d="M17 4v10" />
      <path d="M17 18v2" />
      <circle cx="7" cy="12" r="2.2" />
      <circle cx="12" cy="8" r="2.2" />
      <circle cx="17" cy="16" r="2.2" />
    </>
  ),
  drag: (
    <>
      <path d="M3.5 12h17" />
      <path d="m7 8.5-3.5 3.5L7 15.5" />
      <path d="m17 8.5 3.5 3.5-3.5 3.5" />
    </>
  ),
  list: (
    <>
      <path d="M3.5 6l1 1 2-2" />
      <path d="M3.5 12l1 1 2-2" />
      <path d="M3.5 18l1 1 2-2" />
      <path d="M9.5 6H20" />
      <path d="M9.5 12H20" />
      <path d="M9.5 18H20" />
    </>
  ),
  chart: (
    <>
      <path d="M3.5 20h17" />
      <path d="M6 20v-6" />
      <path d="M11 20V6" />
      <path d="M16 20v-9" />
      <path d="M20.5 20v-4" />
    </>
  ),
  cable: (
    <>
      <path d="M3 15c2.5 0 2.5-4 5-4s2.5 4 5 4 2.5-4 4-4" />
      <rect x="17.5" y="9.5" width="3.5" height="5" rx="1" />
    </>
  ),
  palette: (
    <>
      <path d="M12 20.5a8.5 8.5 0 1 1 0-17c1.5 0 2 .8 2 1.9 0 1.4-1.2 1.9-1.2 3.2 0 1.4 1.2 2.4 2.7 2.4h4.4a3.6 3.6 0 0 0 3.6-3.6c0-.6.3-1.5 1.4-1.5 2 0 3.1 1.7 3.1 4.1a8.5 8.5 0 0 1-8.5 8.5z" />
      <circle cx="8" cy="10" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  shuffle: (
    <>
      <path d="M3.5 7h4l9 10h4" />
      <path d="M3.5 17h4l2.6-2.9" />
      <path d="m17.5 13.5 3 3.5-3 3.5" />
      <path d="m17.5 3.5 3 3.5-3 3.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="18" r="2.4" />
      <circle cx="18" cy="6" r="2.4" />
      <path d="M6 15.6V9.5A2.5 2.5 0 0 1 8.5 7H15.6" />
    </>
  ),
  school: (
    <>
      <path d="M12 4.5 2.5 9 12 13.5l7-3.3V14" />
      <path d="M6.5 11.2V15c0 1.6 2.5 2.9 5.5 2.9s5.5-1.3 5.5-2.9v-3.8" />
      <path d="M21.5 9v6.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-5.2 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.8 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4.5 8.5 12 14l7.5-5.5" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3h5" />
      <path d="M10.5 3v5l-5.3 9.5A2 2 0 0 0 7 20.5h10a2 2 0 0 0 1.8-2.9L13.5 8V3" />
      <path d="M7.8 14.5h8.4" />
    </>
  ),
} as const;

export type LandingIconName = keyof typeof paths;

interface LandingIconProps {
  name: LandingIconName;
  className?: string;
}

/** Ikon garis halaman depan. Ukuran default 24px; ubah lewat className. */
export default function LandingIcon({
  name,
  className = "size-6",
}: LandingIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
