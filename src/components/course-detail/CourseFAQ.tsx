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
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Domande Frequenti
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.id} value={`item-${index}`} className="mb-4">
              <AccordionTrigger className="text-left hover:no-underline bg-white px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <span className="font-semibold text-gray-900">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="bg-white px-6 pb-4 rounded-b-lg">
                <div 
                  className="prose prose-gray max-w-none pt-4"
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
