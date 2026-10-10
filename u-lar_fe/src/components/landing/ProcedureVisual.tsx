/* Visual prosedur: jalur panduan AR dengan empat titik pemeriksaan dari
   alur simulasi — kupas jaket, susun warna, crimping, uji tester. Bukan
   foto atau tangkapan layar; ini diagram teknis yang jujur soal isi
   aplikasi. Rute dan titiknya memakai biru primer. */

const NODES = [
  { x: 90, y: 350, no: "01", label: "Kupas jaket", anchor: "below" },
  { x: 265, y: 175, no: "02", label: "Susun warna", anchor: "above" },
  { x: 455, y: 175, no: "03", label: "Crimping", anchor: "above" },
  { x: 630, y: 350, no: "04", label: "Uji tester", anchor: "below" },
] as const;

export default function ProcedureVisual() {
  return (
    <div>
      <div className="relative overflow-hidden rounded-landing-xl border border-landing-line bg-landing-surface p-2 shadow-landing-panel">
        <div className="relative overflow-hidden rounded-landing-lg bg-landing-surface-low">
          <div
            aria-hidden="true"
            className="ld-blueprint pointer-events-none absolute inset-0"
          />

          <svg
            viewBox="0 0 720 460"
            role="img"
            aria-label="Diagram jalur panduan AR: kupas jaket, susun warna, crimping, uji tester"
            className="relative block h-auto w-full"
          >
            {/* Jalur panduan */}
            <path
              d="M 90 350 L 265 175 L 455 175 L 630 350"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="0.1 14"
              opacity="0.75"
            />

            {/* Titik pemeriksaan */}
            {NODES.map((node, i) => {
              const active = i === 1;
              const labelY = node.anchor === "above" ? node.y - 58 : node.y + 58;
              return (
                <g key={node.no}>
                  {active && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="38"
                      fill="none"
                      stroke="#7dd3fc"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                      opacity="0.9"
                    />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="30"
                    fill="#ffffff"
                    stroke={active ? "#0369a1" : "#e2e8f0"}
                    strokeWidth="2"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="21"
                    fill={active ? "#0369a1" : "#e0f2fe"}
                  />
                  <text
                    x={node.x}
                    y={node.y + 6}
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="700"
                    fill={active ? "#ffffff" : "#0369a1"}
                    fontFamily="Manrope, 'Plus Jakarta Sans', system-ui, sans-serif"
                  >
                    {node.no}
                  </text>
                  <text
                    x={node.x}
                    y={labelY}
                    textAnchor="middle"
                    fontSize="16"
                    fontWeight="600"
                    fill="#0f172a"
                    fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}

            {/* Retikel sudut ala pemandu AR */}
            {[
              "M 28 66 V 36 Q 28 28 36 28 H 66",
              "M 654 28 H 684 Q 692 28 692 36 V 66",
              "M 692 394 V 424 Q 692 432 684 432 H 654",
              "M 66 432 H 36 Q 28 432 28 424 V 394",
            ].map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.55"
              />
            ))}
          </svg>

          {/* Keterangan pemandu di dalam panel */}
          <div className="absolute inset-x-4 bottom-4 rounded-landing bg-landing-dark/85 p-4 text-landing-dark-ink backdrop-blur-md md:inset-x-6 md:bottom-6">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="ld-pulse-dot size-2.5 rounded-full bg-landing-brand-pale"
              />
              <span className="ld-tag uppercase text-landing-brand-pale">
                Pemandu AR · Langkah 7 dari 12
              </span>
            </div>
            <p className="ld-h4 mt-1.5 text-landing-dark-ink">
              Susun warna, lalu kunci dengan crimping
            </p>
            <p className="ld-small mt-1 text-landing-dark-ink-soft">
              Urutan dibandingkan dengan standar T568A/T568B dan masih bisa
              diubah sebelum dikunci.
            </p>
          </div>
        </div>
      </div>

      <p className="ld-small mt-4 px-1 text-landing-ink-soft">
        Simulasi dua belas langkah: dari kupas jaket dan susun konduktor,
        sampai pengujian akhir dengan cable tester.
      </p>
    </div>
  );
}
