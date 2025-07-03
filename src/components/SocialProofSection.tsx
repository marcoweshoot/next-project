
import React from 'react';

const SocialProofSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 text-center">
        <div className="mb-8">
          <p className="text-xl md:text-2xl text-gray-700 font-medium">
            1200 Viaggiatori, 100+ Viaggi organizzati, 18.000 WeShooters dal 2015 con pubblicazioni su
          </p>
        </div>
        
        <div className="flex justify-center items-center flex-wrap gap-8 md:gap-12">
          <img 
            src="/lovable-uploads/58ac45e5-e33d-4269-92bc-6a1ce2626512.png"
            alt="The New York Times"
            className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity"
          />
          <img 
            src="/lovable-uploads/1a40734e-4233-4acd-9d62-a1576ea5be4e.png"
            alt="Forbes"
            className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity"
          />
          <img 
            src="/lovable-uploads/257f2f5c-7be2-4a6b-b173-59285d91c4d5.png"
            alt="Sky TG24"
            className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity"
          />
          <img 
            src="/lovable-uploads/75691805-1c34-46d2-b105-dbb7c9cb0093.png"
            alt="National Geographic"
            className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
