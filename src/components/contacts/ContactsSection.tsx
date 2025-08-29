
import React from 'react';
import { Phone, Mail, MessageCircle, Gift } from 'lucide-react';
import ContactCard from './ContactCard';

const ContactsSection = () => {
  const contactSections = [
    {
      title: "Vuoi prenotare e ti serve aiuto?",
      description: "Hai domande su un viaggio o workshop? Siamo qui per guidarti nella scelta perfetta.",
      icon: Phone,
      contacts: [
        {
          type: "email",
          label: "Email",
          value: "prenotazioni@weshoot.it",
          href: "mailto:prenotazioni@weshoot.it",
          icon: Mail
        },
        {
          type: "whatsapp",
          label: "WhatsApp",
          value: "+39 349 526 9093",
          href: "https://wa.me/393495269093",
          icon: MessageCircle
        },
        {
          type: "phone",
          label: "Telefono",
          value: "+39 349 526 9093",
          href: "tel:+393495269093",
          icon: Phone
        }
      ]
    },
    {
      title: "Hai prenotato e ti serve assistenza?",
      description: "Hai già prenotato e hai bisogno di supporto? Contattaci per qualsiasi chiarimento.",
      icon: MessageCircle,
      contacts: [
        {
          type: "email",
          label: "Email",
          value: "prenotazioni@weshoot.it",
          href: "mailto:prenotazioni@weshoot.it",
          icon: Mail
        },
        {
          type: "whatsapp",
          label: "WhatsApp",
          value: "+39 348 893 3682",
          href: "https://wa.me/393488933682",
          icon: MessageCircle
        }
      ]
    },
    {
      title: "Vuoi regalare un viaggio fotografico/workshop?",
      description: "Regala un'esperienza unica! Ti aiutiamo a scegliere il regalo perfetto.",
      icon: Gift,
      contacts: [
        {
          type: "whatsapp",
          label: "WhatsApp",
          value: "+39 349 526 9093",
          href: "https://wa.me/393495269093",
          icon: MessageCircle
        },
        {
          type: "phone",
          label: "Telefono",
          value: "+39 349 526 9093",
          href: "tel:+393495269093",
          icon: Phone
        },
        {
          type: "email",
          label: "Email",
          value: "marco@weshoot.it",
          href: "mailto:marco@weshoot.it",
          icon: Mail
        }
      ]
    }
  ];

  return (
<section className="py-16 bg-primary dark:bg-background transition-colors">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Come possiamo aiutarti?
      </h2>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
        Scegli il tipo di supporto di cui hai bisogno e contattaci attraverso il canale che preferisci
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {contactSections.map((section, index) => (
        <ContactCard key={index} section={section} />
      ))}
    </div>
  </div>
</section>

  );
};

export default ContactsSection;
