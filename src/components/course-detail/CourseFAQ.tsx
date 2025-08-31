import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQ } from '@/types';

interface CourseFAQProps {
  faqs: FAQ[];
}

const CourseFAQ: React.FC<CourseFAQProps> = ({ faqs }) => {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">
          Domande Frequenti
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.id}
              value={`item-${index}`}
              className="rounded-lg shadow-sm border border-border overflow-hidden bg-card text-card-foreground"
            >
              <AccordionTrigger
                className="px-6 py-4 text-left hover:no-underline hover:bg-muted transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                           focus-visible:ring-offset-2 focus-visible:ring-offset-background
                           data-[state=open]:bg-muted"
              >
                <span className="font-semibold text-foreground">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div
                  className="prose max-w-none leading-relaxed text-muted-foreground dark:prose-invert
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

export default CourseFAQ;
