// Questo file è completamente statico e può essere SSG/SSR/ISR friendly

const GalleryHeader = () => {
  return (
    <header className="mb-12 text-center" aria-labelledby="gallery-title">
      <h2
        id="gallery-title"
        className="mb-4 text-3xl font-bold text-foreground md:text-4xl text-balance"
      >
        Le Foto dei Nostri Viaggiatori
      </h2>
      <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
        Lasciati ispirare dalle foto scattate dai partecipanti ai nostri viaggi fotografici
      </p>
    </header>
  );
};

export default GalleryHeader;
