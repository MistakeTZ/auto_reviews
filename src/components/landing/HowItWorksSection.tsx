"use client";

import Reveal from "@/components/ui/Reveal";
import { useMobile } from "@/hooks/useMobile";

type HowItWorksSectionProps = {
  t: (key: string) => string;
};

export default function HowItWorksSection({ t }: HowItWorksSectionProps) {
  const isMobileVideo = useMobile(768);

  return (
    <section
      className="why-choose-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20"
      style={{ contentVisibility: "auto", containIntrinsicSize: "780px" }}
      id="demo"
    >
      <div className="why-choose-container mx-auto max-w-[1200px] text-center">
        <Reveal
          as="span"
          className="why-choose-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
          direction="up"
        >
          {t("landing.process")}
        </Reveal>
        <Reveal
          as="h2"
          className="why-choose-title mb-12 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]"
          direction="up"
          delay={100}
        >
          {t("landing.howItWorks")}
        </Reveal>
        <Reveal
          className="mx-auto w-full flex justify-center px-4"
          direction="zoom"
          delay={150}
        >
          {isMobileVideo ? (
            <div className="relative aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-[24px] border border-black/5 bg-[#f3f4f6] shadow-[0_20px_40px_rgba(10,25,47,0.08)]">
              <iframe
                src="https://www.youtube.com/embed/prZ7yU8ioOI"
                title={t("landing.howItWorksMobileTitle")}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              ></iframe>
            </div>
          ) : (
            <div className="relative aspect-video w-full max-w-[850px] overflow-hidden rounded-[24px] border border-black/5 bg-[#f3f4f6] shadow-[0_20px_40px_rgba(10,25,47,0.08)]">
              <iframe
                src="https://www.youtube.com/embed/z8gAzje9ho4"
                title={t("landing.howItWorksDesktopTitle")}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              ></iframe>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
