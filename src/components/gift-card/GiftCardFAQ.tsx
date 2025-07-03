
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const GiftCardFAQ: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Come si acquistano?
          </h2>
          <p className="text-lg text-gray-600">
            Tutte le risposte alle domande più frequenti sulle nostre carte regalo
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left">
              Come funziona l'acquisto di una carta regalo?
            </AccordionTrigger>
            <AccordionContent>
              Scegli l'importo desiderato, procedi con il pagamento sicuro tramite Stripe e riceverai immediatamente la carta regalo via email con un codice univoco da utilizzare per prenotare qualsiasi viaggio fotografico.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left">
              Le carte regalo hanno una scadenza?
            </AccordionTrigger>
            <AccordionContent>
              Le nostre carte regalo non hanno scadenza e possono essere utilizzate in qualsiasi momento per prenotare uno dei nostri viaggi fotografici.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left">
              Posso utilizzare la carta regalo per qualsiasi destinazione?
            </AccordionTrigger>
            <AccordionContent>
              Sì, le carte regalo WeShoot possono essere utilizzate per qualsiasi destinazione e viaggio fotografico presente nel nostro catalogo.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left">
              Cosa succede se il viaggio costa più della carta regalo?
            </AccordionTrigger>
            <AccordionContent>
              Se il viaggio scelto costa più dell'importo della carta regalo, sarà possibile pagare la differenza con qualsiasi metodo di pagamento accettato.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left">
              Posso regalare una carta regalo a più persone?
            </AccordionTrigger>
            <AccordionContent>
              Certamente! Puoi acquistare più carte regalo e inviarle a destinatari diversi. Ogni carta avrà un codice univoco.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default GiftCardFAQ;
