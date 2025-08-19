import SEO from '@/components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactsHero from '@/components/contacts/ContactsHero';
import ContactsSection from '@/components/contacts/ContactsSection';

export const dynamic = 'force-static';

export default function ContactsPage() {
  return (
    <>
      <SEO 
        title="Contatti | WeShoot - Viaggi Fotografici"
        description="Hai bisogno di aiuto per prenotare un viaggio fotografico? Contattaci per assistenza, informazioni o per regalare un'esperienza unica."
        url="https://www.weshoot.it/contatti"
      />
      <Header />
      {/* Aggiunto solo un id per accessibilità (non cambia il layout) */}
      <main id="main-content">
        <ContactsHero />
        <ContactsSection />
      </main>
      <Footer />
    </>
  );
}
