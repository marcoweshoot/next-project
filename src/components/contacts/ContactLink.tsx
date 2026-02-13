'use client';

import React from 'react';
import { trackLead } from '@/utils/facebook';

interface Contact {
  type: string;
  label: string;
  value: string;
  href: string;
}

interface ContactLinkProps {
  contact: Contact;
  sectionTitle: string;
  children: React.ReactNode;
}

/**
 * Client-side wrapper for contact links to handle Facebook Pixel tracking
 */
const ContactLink: React.FC<ContactLinkProps> = ({ contact, sectionTitle, children }) => {
  const isExternal = contact.href.startsWith('http');

  const handleClick = () => {
    // Track Lead event for WhatsApp clicks
    if (contact.type === 'whatsapp') {
      trackLead({
        contentName: `WhatsApp Contact - ${sectionTitle}`,
        contentCategory: 'Contatti',
        value: 0,
      });
    }
  };

  return (
    <a
      href={contact.href}
      onClick={handleClick}
      className="flex items-center p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-label={`${contact.label}: ${contact.value}`}
    >
      {children}
    </a>
  );
};

export default ContactLink;
