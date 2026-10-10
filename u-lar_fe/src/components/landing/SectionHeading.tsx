import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  eyebrowClassName?: string;
  title: ReactNode;
  lead?: string;
  align?: "left" | "center";
}

/* Kepala bagian yang dipakai berulang: rambu huruf kapital, judul,
   dan kalimat pembuka. */
export default function SectionHeading({
  eyebrow,
  eyebrowClassName = "text-landing-brand-deep",
  title,
  lead,
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={`ld-eyebrow ${eyebrowClassName}`}>{eyebrow}</p>
      <h2 className="ld-h2 mt-3 text-landing-ink">{title}</h2>

      {lead !== undefined && (
        <p className="ld-body mt-3 text-landing-ink-soft">{lead}</p>
      )}
    </div>
  );
}
