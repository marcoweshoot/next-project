
import Link from "next/link";
import React from 'react';
import { Button } from '@/components/ui/button';

const AcademySection: React.FC<{
  children?: React.ReactNode;
}> = (
  {
    children
  }
) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            La più completa accademia fotografica online di fotografia paesaggistica
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Già 2880+ studenti hanno studiato sull'accademia fotografica di WeShoot
          </p>
        </div>

        {/* Academy Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side - Image */}
          <div className="overflow-hidden rounded-lg">
            <img 
              src="/lovable-uploads/5aea2ea1-ac9d-4d00-974f-0f52e38a033f.png" 
              alt="Accademia fotografica Online"
              className="w-full h-auto"
            />
          </div>

          {/* Right side - Content */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Accedi all'
              <span className="text-red-500">accademia fotografica</span>
            </h3>
            
            <h4 className="text-xl font-semibold text-gray-700 mb-6">
              Migliora le tue foto seguendo i consigli di professionisti
            </h4>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold mr-3">
                  1
                </div>
                <div className="pt-1">
                  Segui i <strong>corsi online di fotografia</strong>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold mr-3">
                  2
                </div>
                <div className="pt-1">
                  Condividi con la community le tue foto
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold mr-3">
                  3
                </div>
                <div className="pt-1">
                  Diventa un master
                </div>
              </li>
            </ul>
            
            <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white">
              <Link href="https://accademia.weshoot.it/" target="_blank" rel="noopener noreferrer">
                Inizia Ora
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcademySection;
