'use client';

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CameraIcon } from "@/components/icons/CameraIcon";
import { MapPinIcon } from "@/components/icons/MapPinIcon";
import { UsersIcon } from "@/components/icons/UsersIcon";
import { StarIcon } from "@/components/icons/StarIcon";

const POSTER_URL =
  "https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture/Viaggi%20Fotografici.avif";

const VIDEO_URL =
  "https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/videos/weshoot-viaggi-fotografici.mp4";

const HeroVideoSection: React.FC = () => {
  const stats = [
    { icon: <CameraIcon />, label: "Viaggi Fotografici", value: "150+" },
    { icon: <MapPinIcon />, label: "Destinazioni", value: "25+" },
    { icon: <UsersIcon />, label: "Partecipanti Felici", value: "1200+" },
    { icon: <StarIcon />, label: "Recensioni 5 Stelle", value: "99%" },
  ];

  // --- Fallback autoplay robusto ---
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // requisiti per autoplay mobile/safari
    v.muted = true;
    v.playsInline = true;
    v.setAttribute("muted", ""); // safari iOS require attribute presence

    const tryPlay = () => {
      // Evita errori non catturati in console
      return v.play().catch(() => {});
    };

    // 1) tenta subito
    tryPlay();

    // 2) ritenta quando torna visibile (es. da tab in background)
    const onVisibility = () => {
      if (document.visibilityState === "visible") tryPlay();
    };

    // 3) prima interazione utente ⇒ ritenta e poi smonta i listener
    const onFirstInteract = () => {
      tryPlay();
      window.removeEventListener("pointerdown", onFirstInteract, true);
      window.removeEventListener("keydown", onFirstInteract, true);
      window.removeEventListener("touchstart", onFirstInteract, { capture: true } as any);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointerdown", onFirstInteract, true);
    window.addEventListener("keydown", onFirstInteract, true);
    window.addEventListener("touchstart", onFirstInteract, { passive: true, capture: true });

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointerdown", onFirstInteract, true);
      window.removeEventListener("keydown", onFirstInteract, true);
      window.removeEventListener("touchstart", onFirstInteract, { capture: true } as any);
    };
  }, []);

  return (
    <section
      className="relative min-h-[88svh] md:min-h-[92svh] grid grid-rows-[1fr_auto_1fr] overflow-hidden pb-[env(safe-area-inset-bottom)]"
      aria-label="Video Hero Section"
    >
      {/* Background: poster su mobile, video da md+ */}
      <div className="absolute inset-0 z-0" aria-hidden>
        {/* Poster LCP solo mobile */}
        <Image
          src={POSTER_URL}
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 100vw, 0px"
          className="object-cover md:hidden"
        />

        {/* Video solo da md+, senza preload aggressivo */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER_URL}
          className="hidden md:block w-full h-full object-cover absolute z-0"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />
      </div>

      {/* Contenuto centrale */}
      <div className="relative z-20 row-start-2 w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6 md:gap-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-tight tracking-tight">
            Fotografa con le persone che
            <br />
            <span className="text-gradient bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              condividono la tua stessa passione
            </span>
          </h1>

          <Button
            size="lg"
            className="text-lg px-12 py-4 bg-red-600 text-white font-semibold rounded-lg shadow-xl hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            asChild
          >
            <Link href="/viaggi-fotografici">Vedi partenze</Link>
          </Button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl w-full">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-white/10 ring-1 ring-white/10"
              >
                {stat.icon}
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-300 dark:text-gray-200">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center pb-[env(safe-area-inset-bottom)]">
        <a href="#contenuti" aria-label="Scorri per scoprire" className="flex flex-col items-center">
          <span className="text-[10px] tracking-wide uppercase text-white/90">Scorri</span>
          <div className="mt-1 w-6 h-10 border-2 border-white rounded-full flex justify-center items-start">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce" />
          </div>
        </a>
      </div>
    </section>
  );
};

export default HeroVideoSection;
