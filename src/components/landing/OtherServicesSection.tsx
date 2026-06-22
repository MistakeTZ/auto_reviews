"use client";

import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { ArrowUpRight } from "lucide-react";

type OtherServicesSectionProps = {
  t: (key: string) => string;
  isAuthenticated: boolean;
  targetService?: "reanswer" | "respam";
};

export default function OtherServicesSection({
  t,
  isAuthenticated,
  targetService = "respam",
}: OtherServicesSectionProps) {
  const isReSpam = targetService === "respam";

  const titleKey = isReSpam ? "landing.otherServicesReSpamTitle" : "landing.otherServicesReAnswerTitle";
  const descKey = isReSpam ? "landing.otherServicesReSpamDesc" : "landing.otherServicesReAnswerDesc";
  const ctaKey = isReSpam ? "landing.otherServicesCta" : "landing.otherServicesReAnswerCta";
  const subtitleKey = isReSpam ? "landing.otherServicesSubtitle" : "landing.otherServicesReAnswerSubtitle";

  const href = isReSpam
    ? (isAuthenticated ? "/spam/dashboard" : "/spam")
    : (isAuthenticated ? "/dashboard" : "/");

  const imageSrcSm = isReSpam ? "/spam_sm.webp" : "/dashboard_sm.webp";
  const imageSrcMd = isReSpam ? "/spam_md.webp" : "/dashboard_md.webp";
  const imageAlt = isReSpam ? "reSpam Dashboard" : "reAnswer Dashboard";

  return (
    <section
      className="other-services-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20"
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "700px",
      }}
    >
      <div className="mx-auto max-w-[1200px]">
        <Reveal className="mb-10 text-center" direction="up">
          <span className="mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]">
            {t("landing.otherServices")}
          </span>
          <h2 className="m-0 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]">
            {t("landing.otherServicesTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-[760px] text-[1rem] font-medium leading-[1.7] text-[#4A5568]">
            {t(subtitleKey)}
          </p>
        </Reveal>

        <Reveal
          className="mx-auto max-w-[960px] rounded-[28px] border border-[rgba(37,48,217,0.2)] bg-[linear-gradient(140deg,#0A192F_0%,#1f366c_55%,#2530D9_100%)] p-6 text-white shadow-[0_22px_60px_rgba(15,29,78,0.35)] lg:p-8"
          direction="up"
          delay={90}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            {/* Left side: small image */}
            <div className="w-full md:w-[240px] lg:w-[320px] shrink-0 overflow-hidden rounded-[20px] border border-white/10 bg-white/5 shadow-inner transition duration-300 hover:scale-[1.02]">
              <picture>
                <source media="(max-width: 769px)" srcSet={imageSrcSm} />
                <source media="(min-width: 770px)" srcSet={imageSrcMd} />
                <img
                  src={imageSrcMd}
                  alt={imageAlt}
                  className="h-full w-full object-cover"
                />
              </picture>
            </div>

            {/* Right side: description & button */}
            <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="max-w-[520px]">
                <h3 className="m-0 text-[1.4rem] lg:text-[1.6rem] font-extrabold leading-[1.25] tracking-[-0.3px]">
                  {t(titleKey)}
                </h3>
                <p className="mt-3 text-[0.95rem] lg:text-[1rem] font-medium leading-[1.7] text-white/85">
                  {t(descKey)}
                </p>
              </div>

              <Link
                href={href}
                className="inline-flex min-h-[3.25rem] shrink-0 items-center justify-center gap-2 rounded-[0.75rem] border-2 border-white bg-white px-7 text-[0.98rem] font-bold text-[#0A192F] transition duration-200 hover:-translate-y-0.5 hover:bg-[#f2f5ff]"
              >
                <span>{t(ctaKey)}</span>
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}