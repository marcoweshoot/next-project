// Questo file è completamente statico e può essere SSG/SSR/ISR friendly

const GalleryHeader = () => {
  return (
    <header className="text-center mb-12" aria-labelledby="gallery-title">
      <h2
        id="gallery-title"
        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
      >
        Le Foto dei Nostri Viaggiatori
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Lasciati ispirare dalle foto scattate dai partecipanti ai nostri viaggi fotografici
      </p>
    </header>
  );
};

export default GalleryHeader;
