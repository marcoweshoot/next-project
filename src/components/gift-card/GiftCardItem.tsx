"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gift, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GiftCardItemProps {
  amount: number;
  color: string;
  originalPrice: number;
}

type PaymentResponse = { url: string };

const GiftCardItem: React.FC<GiftCardItemProps> = ({ amount, color, originalPrice }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const supabase = createClient()
      const { data, error } = await supabase.functions.invoke<PaymentResponse>(
        "create-gift-card-payment",
        { body: { amount } }
      );
      if (error) throw error;
      if (!data?.url) throw new Error("URL di pagamento non ricevuto");

      const w = window.open(data.url, "_blank", "noopener,noreferrer");
      if (!w) window.location.href = data.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Si è verificato un errore";
      toast({ title: "Errore nel pagamento", description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
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
          <div className="text-sm text-muted-foreground">
            Prezzo originale: €{originalPrice}
          </div>
        </div>
        <Button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Elaborazione...
            </>
          ) : (
            "Acquista Ora"
          )}
        </Button>
      </div>
    </div>
  );
};

export default GiftCardItem;
