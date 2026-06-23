"use client";

import { useState } from "react";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import { useMobile } from "@/hooks/useMobile";

type DemoVideoSectionProps = {
  t: (key: string) => string;
};

const MOBILE_VIDEO_ID = "u9tRrFW70uU";
const DESKTOP_VIDEO_ID = "nKznZP_mzuE";

function getYoutubeVideoId(url: string) {
  try {
    const parsedUrl = new URL(url);
    const shortId = parsedUrl.hostname.includes("youtu.be")
      ? parsedUrl.pathname.slice(1)
      : parsedUrl.searchParams.get("v");

    return shortId || "";
  } catch {
    return "";
  }
}

export default function DemoVideoSection({ t }: DemoVideoSectionProps) {
  const isMobileVideo = useMobile(768);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoId = isMobileVideo ? MOBILE_VIDEO_ID : DESKTOP_VIDEO_ID;
  const videoTitle = isMobileVideo
    ? t("spamLanding.demoMobileTitle")
    : t("spamLanding.demoDesktopTitle");

  const videoAspect = isMobileVideo
    ? "aspect-[9/16] max-w-[340px]"
    : "aspect-video max-w-[850px]";

  // if (!videoId) {
  //   return null;
  // }

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
          {t("spamLanding.demoTag")}
        </Reveal>
        <Reveal
          as="h2"
          className="why-choose-title mb-12 text-[clamp(1.8rem,3.2vw,2.5rem)] font-extrabold leading-[1.2] tracking-[-0.5px] text-[#0A192F]"
          direction="up"
          delay={100}
        >
          {t("spamLanding.demoTitle")}
        </Reveal>
        <Reveal
          className="mx-auto flex w-full justify-center px-4"
          direction="zoom"
          delay={150}
        >
          <div className={`relative w-full overflow-hidden rounded-[24px] border border-black/5 bg-[#f3f4f6] shadow-[0_20px_40px_rgba(10,25,47,0.08)] ${videoAspect}`}>
            {isPlaying ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              ></iframe>
            ) : (
              <button
                onClick={() => setIsPlaying(true)}
                className="group absolute inset-0 flex h-full w-full items-center justify-center bg-black/10 transition-colors duration-300 hover:bg-black/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1f366c]/50"
                aria-label={`Play video: ${videoTitle}`}
              >
                <Image
                  src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
                  alt={videoTitle}
                  fill
                  sizes="(max-width: 768px) 340px, 850px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 transition-opacity duration-300 group-hover:opacity-80" />
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-md shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-all duration-300 group-hover:scale-110 group-hover:border-white/50 group-hover:bg-white/30 group-hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.5),_0_0_20px_10px_rgba(255,255,255,0.1)]">
                  <div
                    className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 animate-ping"
                    style={{ animationDuration: "2s" }}
                  />
                  <svg
                    className="ml-1.5 h-8 w-8 fill-current text-white transition-transform duration-300 group-hover:scale-105"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}