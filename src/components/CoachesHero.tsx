
import PageBreadcrumbs from '@/components/PageBreadcrumbs';

const CoachesHero = () => {
  const breadcrumbElements = [
    { name: 'WeShoot', path: '/' },
    { name: 'Fotografi' }
  ];

  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 pt-20">
      <div className="absolute inset-0 bg-black/40" />
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(/lovable-uploads/c5576e2f-e793-4fb4-ac69-481bbd9b7174.png)`
        }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Scopri i tuoi coach
          </h1>
          <p className="text-sm text-gray-300 uppercase tracking-wider mb-8">
            WESHOOT FOTOGRAFI
          </p>
          
          {/* Breadcrumbs */}
          <div className="flex justify-center">
            <PageBreadcrumbs elements={breadcrumbElements} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoachesHero;
