import React from 'react';
import { LucideIcon } from 'lucide-react';
import ContactLink from './ContactLink';

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

          return (
            <ContactLink
              key={index}
              contact={contact}
              sectionTitle={title}
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
            </ContactLink>
          );
        })}
      </div>
    </div>
  );
};

export default ContactCard;
