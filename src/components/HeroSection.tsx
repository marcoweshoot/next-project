
import Link from "next/link";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, Star, Users } from 'lucide-react';

const HeroSection = () => {
  const stats = [
    { icon: Camera, label: 'Viaggi Fotografici', value: '50+' },
    { icon: MapPin, label: 'Destinazioni', value: '25+' },
    { icon: Users, label: 'Partecipanti Felici', value: '1000+' },
    { icon: Star, label: 'Recensioni 5 Stelle', value: '98%' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/picture//Viaggi%20Fotografici.avif")'
          }}
        />
      </div>
      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          {/* Main heading with exact spacing from reference */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 leading-tight tracking-tight">
            Fotografa con le persone che
            <br />
            <span className="text-gradient bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              condividono la tua stessa passione
            </span>
          </h1>

          {/* Breadcrumb-style text */}
          <div className="text-white/80 text-sm tracking-wider uppercase mb-8 font-medium">
            WESHOOT • VIAGGI FOTOGRAFICI • DESTINAZIONI • NORVEGIA • SENJA
          </div>

          {/* CTA Button with exact styling from reference */}
          <div className="mb-20">
            <Button 
              size="lg" 
              className="text-lg px-12 py-4 bg-red-600 hover:bg-red-600 text-white font-semibold rounded-lg shadow-lg" 
              asChild
            >
              <Link href="/viaggi-fotografici">
                Vedi partenze
              </Link>
            </Button>
          </div>

          {/* Social proof text */}
          <div className="text-white/90 text-lg mb-12 font-medium max-w-4xl mx-auto">
            1200 Viaggiatori, 100+ Viaggi organizzati, 18.000 WeShooters dal 2015 con pubblicazioni su
          </div>

          {/* Media logos placeholder - simplified stats for now */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-80">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
