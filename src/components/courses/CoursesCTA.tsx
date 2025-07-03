
import React from 'react';

const CoursesCTA = () => {
  return (
    <section className="py-16 bg-primary text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Pronto a Iniziare il Tuo Viaggio Fotografico?
        </h2>
        <p className="text-xl mb-8 text-primary-foreground/90">
          Unisciti a migliaia di fotografi che hanno trasformato la loro passione in professione
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://accademia.weshoot.it/wp-login"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Accedi all'Accademia
          </a>
          <a 
            href="/viaggi-fotografici"
            className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
          >
            Scopri i Viaggi
          </a>
        </div>
      </div>
    </section>
  );
};

export default CoursesCTA;
