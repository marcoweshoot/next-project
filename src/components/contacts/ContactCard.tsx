'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { trackLead } from '@/utils/facebook';

interface Contact {
  type: string;
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
}

interface ContactSection {
  title: string;
  description: string;
  icon: LucideIcon;
  contacts: Contact[];
}

interface ContactCardProps {
  section: ContactSection;
}

const ContactCard: React.FC<ContactCardProps> = ({ section }) => {
  const { title, description, icon: SectionIcon, contacts } = section;

  const handleContactClick = (contact: Contact) => {
    // Track Lead event for WhatsApp clicks
    if (contact.type === 'whatsapp') {
      trackLead({
        contentName: `WhatsApp Contact - ${title}`,
        contentCategory: 'Contatti',
        value: 0,
      });
    }
  };

  return (
    <div className="rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-border bg-card text-card-foreground">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <SectionIcon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-3">
          {title}
        </h3>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="space-y-4">
        {contacts.map((contact, index) => {
          const Icon = contact.icon;
          const isExternal = contact.href.startsWith('http');

          return (
            <a
              key={index}
              href={contact.href}
              onClick={() => handleContactClick(contact)}
              className="flex items-center p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              aria-label={`${contact.label}: ${contact.value}`}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">
                  {contact.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {contact.value}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default ContactCard;
