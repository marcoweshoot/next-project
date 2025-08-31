import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface CollectionDetailFAQProps {
  faqs: FAQ[];
  collectionName: string;
}

const CollectionDetailFAQ: React.FC<CollectionDetailFAQProps> = ({ faqs, collectionName }) => {
  return (
    <section className="py-16 bg-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Domande più frequenti su {collectionName}
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="rounded-lg shadow-sm border border-border bg-card text-card-foreground"
            >
              <AccordionTrigger
                className="px-6 py-4 text-left font-semibold hover:no-underline
                           hover:bg-muted transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                           focus-visible:ring-offset-2 focus-visible:ring-offset-background
                           data-[state=open]:bg-muted"
              >
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div
                  className="prose max-w-none text-muted-foreground dark:prose-invert
                             prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default CollectionDetailFAQ;
