"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import { useAppStore } from "@/store/useAppStore";
import Image from "next/image";

type TestimonialsSectionProps = {
  t: (key: string) => string;
  prefix?: "landing" | "spamLanding";
};

export default function TestimonialsSection({
  t,
  prefix = "landing",
}: TestimonialsSectionProps) {
  const [expandedTestimonials, setExpandedTestimonials] = useState<number[]>(
    [],
  );

  const toggleTestimonial = (index: number) => {
    setExpandedTestimonials((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  };

  const language = useAppStore((state) => state.language);

  const testimonialsData = [
    {
      id: "testimonial1",
      avatar: "/avatar_alexey.webp",
      verifiedBadge: "5+ hours saved per week",
      verifiedBadgeRu: "5+ часов сэкономлено в неделю",
    },
    {
      id: "testimonial2",
      avatar: "/avatar_maria.webp",
      verifiedBadge: "0 warnings",
      verifiedBadgeRu: "0 штрафов",
    },
    {
      id: "testimonial3",
      avatar: "/avatar_dmitry.webp",
      verifiedBadge: "24/7 instant replies",
      verifiedBadgeRu: "Ответы 24/7",
    },
  ];

  const testimonials = testimonialsData.map((data) => ({
    text: t(`${prefix}.${data.id}.text`),
    author: t(`${prefix}.${data.id}.author`),
    role: t(`${prefix}.${data.id}.role`),
    link: t(`${prefix}.${data.id}.link`),
    avatar: data.avatar,
    badge: language === "ru" ? data.verifiedBadgeRu : data.verifiedBadge,
  }));

  return (
    <section
      className="about-us-section bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fb_100%)] px-4 py-16 lg:px-8 lg:py-20"
      style={{ contentVisibility: "auto", containIntrinsicSize: "760px" }}
    >
      <div className="about-us-intro mx-auto mb-12 max-w-[1200px] text-center">
        <Reveal
          as="span"
          className="about-us-eyebrow mb-3 inline-block text-[0.78rem] font-bold uppercase tracking-[1.6px] text-[#1f366c]"
          direction="up"
        >
          {t("landing.reviews")}
        </Reveal>
        <Reveal
          as="h2"
          className="about-us-headline m-0 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]"
          direction="up"
          delay={90}
        >
          {t("landing.testimonialsTitle")}
        </Reveal>
      </div>
      <div className="about-us-pillars mx-auto grid max-w-[1200px] items-start gap-[clamp(1.25rem,3vw,2rem)] grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((testimonial, idx) => {
          const hasLink =
            testimonial.link && testimonial.link.startsWith("http");
          return (
            <Reveal
              key={idx}
              onClick={() => toggleTestimonial(idx)}
              onKeyDown={(event) => {
                if (event.currentTarget !== event.target) {
                  return;
                }
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleTestimonial(idx);
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={expandedTestimonials.includes(idx)}
              className="about-us-card group flex h-fit w-full flex-col self-start rounded-[20px] border border-[rgba(10,25,47,0.07)] bg-white p-6 sm:p-8 lg:p-10 text-left transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.01] hover:border-indigo-200 hover:shadow-[0_20px_40px_rgba(99,102,241,0.08),0_10px_20px_rgba(10,25,47,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2530D9] focus-visible:ring-offset-2 cursor-pointer"
              direction="up"
              delay={110 + idx * 85}
            >
              <div className="about-us-card-author flex items-center gap-3">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  width={44}
                  height={44}
                  className="about-us-card-avatar h-11 w-11 rounded-full object-cover border border-slate-100 transition-transform duration-300 group-hover:scale-105 shrink-0"
                />
                <div className="about-us-card-info flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {hasLink ? (
                      <a
                        href={testimonial.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[0.95rem] font-bold text-[#0A192F] transition hover:text-[#2530D9] hover:underline"
                      >
                        {testimonial.author}
                        <ExternalLink size={12} className="text-[#2530D9] shrink-0" />
                      </a>
                    ) : (
                      <h3 className="m-0 text-[0.95rem] font-bold text-[#0A192F]">
                        {testimonial.author}
                      </h3>
                    )}
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      ✓ {testimonial.badge}
                    </span>
                  </div>
                  <p className="m-0 text-[0.8rem] text-[#4A5568] truncate">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Smooth Height Animation for Expandable Testimonial Text */}
              <div className="relative w-full mt-6">
                <motion.div
                  layout
                  initial={false}
                  animate={{
                    height: expandedTestimonials.includes(idx)
                      ? "auto"
                      : "82px",
                  }}
                  transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  className="overflow-hidden w-full"
                >
                  <p className="text-[1rem] italic leading-[1.7] text-[#4A5568] m-0">
                    {testimonial.text}
                  </p>
                </motion.div>

                {/* Gradient Fade Overlay when Collapsed */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300 ${
                    expandedTestimonials.includes(idx)
                      ? "opacity-0"
                      : "opacity-100"
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleTestimonial(idx);
                }}
                className="mt-5 inline-flex items-center text-[0.85rem] font-semibold text-[#2530D9] opacity-80 transition hover:opacity-100 cursor-pointer bg-transparent border-0 p-0"
              >
                {expandedTestimonials.includes(idx)
                  ? t("landing.hideMore")
                  : t("landing.readMore")}
                <ChevronDown
                  size={16}
                  className={`ml-1.5 transition-transform duration-300 ${
                    expandedTestimonials.includes(idx) ? "rotate-180" : ""
                  }`}
                />
              </button>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
