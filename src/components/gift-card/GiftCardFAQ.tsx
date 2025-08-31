import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const GiftCardFAQ: React.FC = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Come si acquistano?
          </h2>
          <p className="text-lg text-muted-foreground">
            Tutte le risposte alle domande più frequenti sulle nostre carte regalo
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem
            value="item-1"
            className="rounded-lg shadow-sm border border-border overflow-hidden bg-card text-card-foreground"
          >
            <AccordionTrigger
              className="text-left px-6 py-4 hover:no-underline hover:bg-muted transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                         focus-visible:ring-offset-2 focus-visible:ring-offset-background
                         data-[state=open]:bg-muted"
            >
              Come funziona l&apos;acquisto di una carta regalo?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground">
              Scegli l&apos;importo desiderato, procedi con il pagamento sicuro tramite Stripe e
              riceverai immediatamente la carta regalo via email con un codice univoco da utilizzare
              per prenotare qualsiasi viaggio fotografico.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-2"
            className="rounded-lg shadow-sm border border-border overflow-hidden bg-card text-card-foreground"
          >
            <AccordionTrigger
              className="text-left px-6 py-4 hover:no-underline hover:bg-muted transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                         focus-visible:ring-offset-2 focus-visible:ring-offset-background
                         data-[state=open]:bg-muted"
            >
              Le carte regalo hanno una scadenza?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground">
              Le nostre carte regalo non hanno scadenza e possono essere utilizzate in qualsiasi
              momento per prenotare uno dei nostri viaggi fotografici.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-3"
            className="rounded-lg shadow-sm border border-border overflow-hidden bg-card text-card-foreground"
          >
            <AccordionTrigger
              className="text-left px-6 py-4 hover:no-underline hover:bg-muted transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                         focus-visible:ring-offset-2 focus-visible:ring-offset-background
                         data-[state=open]:bg-muted"
            >
              Posso utilizzare la carta regalo per qualsiasi destinazione?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground">
              Sì, le carte regalo WeShoot possono essere utilizzate per qualsiasi destinazione e
              viaggio fotografico presente nel nostro catalogo.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-4"
            className="rounded-lg shadow-sm border border-border overflow-hidden bg-card text-card-foreground"
          >
            <AccordionTrigger
              className="text-left px-6 py-4 hover:no-underline hover:bg-muted transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                         focus-visible:ring-offset-2 focus-visible:ring-offset-background
                         data-[state=open]:bg-muted"
            >
              Cosa succede se il viaggio costa più della carta regalo?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground">
              Se il viaggio scelto costa più dell&apos;importo della carta regalo, sarà possibile
              pagare la differenza con qualsiasi metodo di pagamento accettato.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-5"
            className="rounded-lg shadow-sm border border-border overflow-hidden bg-card text-card-foreground"
          >
            <AccordionTrigger
              className="text-left px-6 py-4 hover:no-underline hover:bg-muted transition-colors
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                         focus-visible:ring-offset-2 focus-visible:ring-offset-background
                         data-[state=open]:bg-muted"
            >
              Posso regalare una carta regalo a più persone?
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4 text-muted-foreground">
              Certamente! Puoi acquistare più carte regalo e inviarle a destinatari diversi. Ogni
              carta avrà un codice univoco.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default GiftCardFAQ;
