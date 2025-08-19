import React from 'react';
import { LucideIcon } from 'lucide-react';

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
    <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <SectionIcon className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          {title}
        </h3>
        <p className="text-gray-600">
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
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              aria-label={`${contact.label}: ${contact.value}`}
            >
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {contact.label}
                </div>
                <div className="text-sm text-gray-600">
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
