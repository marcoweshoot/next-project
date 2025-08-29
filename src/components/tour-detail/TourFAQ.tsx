'use client';

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

function slugify(input: string | number | undefined | null) {
  return (
    String(input ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'item'
  );
}

interface FAQ {
  id?: string | number | null;
  question: string;
  answer: string;
}

interface TourFAQProps {
  faqs: FAQ[];
}

const TourFAQ: React.FC<TourFAQProps> = ({ faqs }) => {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-16 bg-background transition-colors">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Domande Frequenti
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => {
              const safe = `${slugify(faq.id ?? faq.question)}-${i}`;
              return (
                <AccordionItem
                  key={safe}
                  value={safe}
                  className="rounded-lg shadow-sm border border-border overflow-hidden bg-card text-card-foreground"
                >
                  <AccordionTrigger
                    className="px-6 py-4 text-left hover:no-underline
                               hover:bg-muted/60 dark:hover:bg-muted/40
                               transition-colors
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                               focus-visible:ring-offset-2 focus-visible:ring-offset-background
                               data-[state=open]:bg-muted/60 dark:data-[state=open]:bg-muted/40"
                  >
                    <h3 className="text-lg font-semibold text-foreground pr-4">
                      {faq.question}
                    </h3>
                  </AccordionTrigger>

                  <AccordionContent className="px-6 pb-4">
                    <div
                      className="prose max-w-none leading-relaxed text-muted-foreground dark:prose-invert
                                 prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default TourFAQ;
