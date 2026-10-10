import { useState } from "react";
import { CONTACT, FAQS } from "./landingData";
import LandingIcon from "./LandingIcon";
import SectionHeading from "./SectionHeading";

/* Tanya jawab + kartu kontak institusional. Accordion memakai tombol
   semantik dengan aria-expanded/aria-controls sesuai DESIGN.md; panel
   yang tertutup dikeluarkan dari pohon aksesibilitas lewat `hidden`. */
export default function LandingFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" aria-label="Tanya jawab" className="ld-section scroll-mt-24">
      <div className="ld-container grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <SectionHeading
            eyebrow="Tanya jawab"
            eyebrowClassName="text-landing-sage-deep"
            title="Masih ingin mengenal U-LAR lebih jauh?"
            lead="Jawaban seputar konsep, cara belajar, dan batasan media ini."
          />

          <div className="mt-8 flex flex-col gap-3">
            {FAQS.map((item, index) => {
              const isOpen = open === index;
              const triggerId = `faq-trigger-${index}`;
              const panelId = `faq-panel-${index}`;

              return (
                <div
                  key={item.question}
                  className={`ld-card overflow-hidden transition-shadow duration-200 ${
                    isOpen ? "shadow-landing-card-hover" : ""
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      id={triggerId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-6"
                    >
                      <span className="ld-h4 text-landing-ink">
                        {item.question}
                      </span>
                      <LandingIcon
                        name="chevron-down"
                        className={`size-5 shrink-0 text-landing-ink-soft transition-transform duration-200 motion-reduce:transition-none ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    hidden={!isOpen}
                    className="px-5 pb-5 md:px-6"
                  >
                    <p className="ld-body text-landing-ink-soft">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div id="kontak" className="scroll-mt-28 lg:col-span-5">
          <div className="ld-card flex h-full flex-col p-7 shadow-landing-card-hover md:p-8">
            <span className="ld-icon-tile bg-landing-sage-pale text-landing-sage-ink">
              <LandingIcon name="school" className="size-6" />
            </span>

            <h3 className="ld-h3 mt-5 text-landing-ink">
              {CONTACT.heading}
            </h3>
            <p className="ld-body mt-2 text-landing-ink-soft">
              {CONTACT.body}
            </p>

            <ul className="ld-small mt-6 flex flex-col gap-3.5 text-landing-ink-soft">
              <li className="flex items-start gap-3">
                <LandingIcon
                  name="pin"
                  className="mt-0.5 size-5 shrink-0 text-landing-sage"
                />
                {CONTACT.address}
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-3 rounded-landing transition-colors hover:text-landing-ink"
                >
                  <LandingIcon
                    name="mail"
                    className="size-5 shrink-0 text-landing-sage"
                  />
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <LandingIcon
                  name="flask"
                  className="size-5 shrink-0 text-landing-sage"
                />
                {CONTACT.research}
              </li>
            </ul>

            <div className="mt-auto pt-7">
              <div className="rounded-landing-md bg-landing-surface-high p-4">
                <p className="ld-eyebrow text-landing-ink-soft">
                  {CONTACT.statusLabel}
                </p>
                <p className="ld-small mt-1.5 text-landing-ink">
                  {CONTACT.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
