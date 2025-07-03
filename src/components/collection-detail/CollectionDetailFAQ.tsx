
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
    <section className="py-16 bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Domande più frequenti su {collectionName}
          </h2>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id}
              className="bg-white rounded-lg shadow-sm border"
            >
              <AccordionTrigger className="px-6 py-4 text-left font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div 
                  className="prose prose-gray max-w-none"
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
