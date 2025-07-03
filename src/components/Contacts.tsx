
import React from 'react';
import SEO from '../components/SEO';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactsHero from '../components/contacts/ContactsHero';
import ContactsSection from '../components/contacts/ContactsSection';

const Contacts = () => {
  return (
    <>
      <SEO 
        title="Contatti | WeShoot - Viaggi Fotografici"
        description="Hai bisogno di aiuto per prenotare un viaggio fotografico? Contattaci per assistenza, informazioni o per regalare un'esperienza unica."
      />
      <Header />
      <div>
        <ContactsHero />
        <ContactsSection />
      </div>
      <Footer />
    </>
  );
};

export default Contacts;
