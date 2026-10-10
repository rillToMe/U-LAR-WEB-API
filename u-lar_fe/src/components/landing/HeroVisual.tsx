import { T568B_PINS } from "./landingData";
import LandingIcon from "./LandingIcon";

/* Visual pahlawan: kabel UTP yang dikupas, delapan konduktor tersusun
   sesuai T568B, masuk ke konektor RJ45 transparan.
 *
 * Digambar sebagai ilustrasi teknis SVG (bukan foto atau render), jadi
 * tajam di semua ukuran, tidak butuh aset eksternal, dan warnanya persis
 * mengikuti data pin T568B dari dokumen aplikasi. Bingkai pemandu memakai
 * biru primer; jaket kabel abu slate netral. */

const WIRE_START_X = 258;
const WIRE_END_X = 604;
const PLUG_X = 478;
const PLUG_W = 185;
const PLUG_Y = 180;
const PLUG_H = 180;

function wirePath(index: number): string {
  const y0 = 258 + (index - 3.5) * 3.4;
  const y1 = 200 + index * 20;
  return `M ${WIRE_START_X} ${y0.toFixed(1)} C 340 ${y0.toFixed(1)}, 350 ${y1}, ${WIRE_END_X} ${y1}`;
}

export default function HeroVisual() {
  return (
    <div className="group relative overflow-hidden rounded-landing-xl border border-landing-line bg-landing-surface p-2 shadow-landing-panel">
      <div className="relative overflow-hidden rounded-landing-lg bg-landing-surface-low">
        <div
          aria-hidden="true"
          className="ld-blueprint pointer-events-none absolute inset-0"
        />

        <svg
          viewBox="0 0 720 540"
          role="img"
          aria-label="Ilustrasi kabel UTP yang dikupas dengan delapan konduktor berwarna tersusun masuk ke konektor RJ45 transparan"
          className="relative block h-auto w-full transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        >
          <defs>
            <radialGradient id="hv-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="hv-jacket" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="55%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="hv-sheen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Cahaya ambient di belakang konektor */}
          <ellipse cx="565" cy="270" rx="190" ry="170" fill="url(#hv-glow)" />

          {/* Bayangan lembut di bawah kipas konduktor */}
          <ellipse cx="360" cy="392" rx="180" ry="22" fill="#0f172a" opacity="0.06" />

          {/* Jaket kabel */}
          <rect x="24" y="243" width="212" height="54" rx="27" fill="url(#hv-jacket)" />
          <rect x="24" y="243" width="212" height="26" rx="13" fill="url(#hv-sheen)" />
          {[70, 104, 138].map((x) => (
            <line
              key={x}
              x1={x}
              y1="249"
              x2={x}
              y2="291"
              stroke="#0f172a"
              strokeWidth="2"
              opacity="0.5"
            />
          ))}
          <text
            x="130"
            y="275"
            textAnchor="middle"
            fontSize="15"
            fontWeight="600"
            letterSpacing="0.06em"
            fill="#f8fafc"
            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
          >
            Cat6 UTP
          </text>

          {/* Boot pelindung */}
          <rect x="234" y="249" width="26" height="42" rx="7" fill="#1e293b" />
          <line x1="241" y1="253" x2="241" y2="287" stroke="#64748b" strokeWidth="2" />
          <line x1="248" y1="253" x2="248" y2="287" stroke="#64748b" strokeWidth="2" />

          {/* Delapan konduktor */}
          {T568B_PINS.map((wire, i) => {
            const d = wirePath(i);
            const y1 = 200 + i * 20;
            return (
              <g key={wire.pin}>
                <path
                  d={d}
                  fill="none"
                  stroke={wire.stripe ?? wire.base}
                  strokeWidth="11"
                  strokeLinecap="round"
                />
                {wire.stripe !== null && (
                  <path
                    d={d}
                    fill="none"
                    stroke="#f5f1e6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="5 6"
                    opacity="0.9"
                  />
                )}
                <text
                  x={PLUG_X - 10}
                  y={y1 + 4.5}
                  textAnchor="end"
                  fontSize="13"
                  fontWeight="600"
                  fill="#64748b"
                  fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                >
                  {wire.pin}
                </text>
              </g>
            );
          })}

          {/* Badan konektor RJ45 transparan */}
          <rect
            x={PLUG_X}
            y={PLUG_Y}
            width={PLUG_W}
            height={PLUG_H}
            rx="18"
            fill="#ffffff"
            fillOpacity="0.55"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />
          <rect
            x={PLUG_X + 12}
            y={PLUG_Y + 12}
            width={PLUG_W - 24}
            height={PLUG_H - 24}
            rx="10"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            opacity="0.7"
          />

          {/* Kontak kuningan tempat tiap konduktor berakhir */}
          {T568B_PINS.map((wire, i) => {
            const y1 = 200 + i * 20;
            return (
              <rect
                key={wire.pin}
                x="592"
                y={y1 - 8}
                width="15"
                height="16"
                rx="4"
                fill="#d9a441"
                stroke="#9a741f"
                strokeWidth="1"
              />
            );
          })}

          {/* Klip pengunci di punggung konektor */}
          <polygon points="548,180 602,180 594,162 556,162" fill="#1e293b" opacity="0.9" />

          {/* Bingkai pemandu AR di sekeliling konektor */}
          <rect
            x={PLUG_X - 12}
            y={PLUG_Y - 12}
            width={PLUG_W + 24}
            height={PLUG_H + 24}
            rx="22"
            fill="none"
            stroke="#0284c7"
            strokeWidth="1.5"
            strokeDasharray="7 6"
            opacity="0.7"
          />
          {[
            `M ${PLUG_X - 12} ${PLUG_Y + 14} V ${PLUG_Y - 12} H ${PLUG_X + 14}`,
            `M ${PLUG_X + PLUG_W - 2} ${PLUG_Y - 12} H ${PLUG_X + PLUG_W + 12} V ${PLUG_Y + 14}`,
            `M ${PLUG_X + PLUG_W + 12} ${PLUG_Y + PLUG_H - 2} V ${PLUG_Y + PLUG_H + 12} H ${PLUG_X + PLUG_W - 2}`,
            `M ${PLUG_X + 14} ${PLUG_Y + PLUG_H + 12} H ${PLUG_X - 12} V ${PLUG_Y + PLUG_H - 2}`,
          ].map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#075985"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* Lencana melayang */}
        <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-landing-surface/90 py-1.5 pl-3 pr-4 shadow-landing-card backdrop-blur-md md:right-6 md:top-6">
          <LandingIcon name="ar" className="size-[18px] text-landing-brand" />
          <span className="ld-tag text-landing-ink">
            Visualisasi pinout 8P8C
          </span>
        </div>

        {/* Strip pinout kaca */}
        <div className="absolute inset-x-4 bottom-4 rounded-landing bg-landing-surface/90 p-3 shadow-landing-card backdrop-blur-md md:inset-x-6 md:bottom-6 md:p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <LandingIcon
                name="ar"
                className="size-5 shrink-0 text-landing-brand"
              />
              <span className="ld-tag truncate text-landing-ink">
                Spasial pinout RJ45 (8P8C)
              </span>
            </div>
            <span className="ld-tag shrink-0 rounded-full bg-landing-brand-pale px-2.5 py-1 text-landing-brand-ink">
              Standar T568B
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-8 gap-1" role="list" aria-label="Urutan warna pin 1 sampai 8">
            {T568B_PINS.map((wire) => (
              <div
                key={wire.pin}
                role="listitem"
                title={`${wire.pin}: ${wire.name}`}
                aria-label={`${wire.pin}: ${wire.name}`}
                className="h-1.5 rounded-full"
                style={
                  wire.stripe === null
                    ? { backgroundColor: wire.base }
                    : {
                        background: `repeating-linear-gradient(135deg, ${wire.base} 0 4px, ${wire.stripe} 4px 8px)`,
                      }
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
