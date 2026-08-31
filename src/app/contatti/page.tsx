import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactsHero from '@/components/contacts/ContactsHero';
import ContactsSection from '@/components/contacts/ContactsSection';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Contatti | WeShoot - Viaggi Fotografici',
  description:
    'Hai bisogno di aiuto per prenotare un viaggio fotografico? Contattaci per assistenza, informazioni o per regalare un\'esperienza unica.',
  alternates: { canonical: '/contatti' },
};

export default function ContactsPage() {
  return (
    <>
      <Header />
      {/* Wrapper tema-aware per dark mode */}
      <div className="min-h-screen bg-background">
        {/* Aggiunto solo un id per accessibilità (non cambia il layout) */}
        <main id="main-content">
          <ContactsHero />
          <ContactsSection />
        </main>
      </div>
      <Footer />
    </>
  );
}
