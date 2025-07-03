
import React from 'react';
import PageBreadcrumbs from '@/components/PageBreadcrumbs';
import { MapPin, Users, Star } from 'lucide-react';

const CollectionsHero: React.FC = () => {
  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Viaggi Fotografici', path: '/viaggi-fotografici/' },
    { name: 'Collezioni' }
  ];

  // Supabase Storage URL for the aurora video
  const videoUrl = "https://wxoodcdxscxazjkoqhsg.supabase.co/storage/v1/object/public/videos/aurora-boreale-viaggio-fotografico-norvegia-2.mp4";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        >
          <source
            src={videoUrl}
            type="video/mp4"
          />
          {/* Fallback image if video doesn't load */}
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")'
            }}
          />
        </video>
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Collezioni Tematiche
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Scopri le nostre collezioni di viaggi fotografici organizzate per tema. 
            Ogni collezione raccoglie esperienze uniche accomunate da soggetti e stili fotografici specifici.
          </p>
          
          {/* Breadcrumbs */}
          <div className="flex justify-center mb-8">
            <PageBreadcrumbs elements={breadcrumbElements} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4">
              <MapPin className="w-5 h-5" />
              <span className="drop-shadow">Temi Unici</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4">
              <Users className="w-5 h-5" />
              <span className="drop-shadow">Piccoli Gruppi</span>
            </div>
            <div className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg py-3 px-4">
              <Star className="w-5 h-5" />
              <span className="drop-shadow">Coach Specializzati</span>
            </div>
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

export default CollectionsHero;
