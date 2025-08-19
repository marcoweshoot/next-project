"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GiftCardItemProps {
  amount: number;
  color: string;
  originalPrice: number;
}

const GiftCardItem: React.FC<GiftCardItemProps> = ({ amount, color, originalPrice }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      console.log(`Creating payment for gift card: €${amount}`);
      
      const { data, error } = await supabase.functions.invoke('create-gift-card-payment', {
        body: { amount }
      });

      if (error) {
        console.error('Error invoking payment function:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Payment URL received, opening in new tab:', data.url);
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      } else {
        throw new Error('URL di pagamento non ricevuto');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Errore nel pagamento",
        description: "Si è verificato un errore durante la creazione del pagamento. Riprova.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className={`${color} p-6 text-white relative`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Gift className="h-8 w-8" />
            <span className="text-lg font-bold">WeShoot</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">€{amount}</div>
            <div className="text-sm opacity-90">Gift Card</div>
          </div>
        </div>
        <div className="text-sm opacity-90">
          Carta regalo valida per tutti i viaggi fotografici
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-center mb-4">
          <div className="text-gray-600 text-sm">Prezzo originale: €{originalPrice}</div>
        </div>
        <Button 
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full"
          style={{ backgroundColor: '#E25141' }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Elaborazione...
            </>
          ) : (
            'Acquista Ora'
          )}
        </Button>
      </div>
    </div>
  );
};

export default GiftCardItem;
