import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { CameraIcon } from "@/components/icons/CameraIcon";
import { MapPinIcon } from "@/components/icons/MapPinIcon";
import { UsersIcon } from "@/components/icons/UsersIcon";
import { StarIcon } from "@/components/icons/StarIcon";

const HeroVideoSection: React.FC = () => {
  const stats = [
    { icon: <CameraIcon />, label: "Viaggi Fotografici", value: "150+" },
    { icon: <MapPinIcon />, label: "Destinazioni", value: "25+" },
    { icon: <UsersIcon />, label: "Partecipanti Felici", value: "1200+" },
    { icon: <StarIcon />, label: "Recensioni 5 Stelle", value: "99%" },
  ];

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Video Hero Section"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover absolute z-0"
        >
          <source
            src="https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/videos/weshoot-viaggi-fotografici.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 leading-tight tracking-tight">
          Fotografa con le persone che
          <br />
          <span className="text-gradient bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            condividono la tua stessa passione
          </span>
        </h1>

        <div className="mb-20">
          <Button
            size="lg"
            className="text-lg px-12 py-4 bg-red-600 text-white font-semibold rounded-lg shadow-xl hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            asChild
          >
            <Link href="/viaggi-fotografici">Vedi partenze</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-white/10 ring-1 ring-white/10"
            >
              {stat.icon}
              <div className="text-2xl md:text-3xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-sm text-gray-300 dark:text-gray-200">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroVideoSection;
