'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Euro, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CustomGiftCard: React.FC = () => {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const MIN_AMOUNT = 10;
  const MAX_AMOUNT = 5000;

  const handleAmountChange = (value: string) => {
    // Allow only numbers and one decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setCustomAmount(numericValue);
    setError(null);
  };

  const validateAmount = (amount: number): string | null => {
    if (amount < MIN_AMOUNT) {
      return `L'importo minimo è €${MIN_AMOUNT}`;
    }
    if (amount > MAX_AMOUNT) {
      return `L'importo massimo è €${MAX_AMOUNT}`;
    }
    // Check if amount has more than 2 decimal places
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return 'L\'importo può avere al massimo 2 decimali';
    }
    return null;
  };

  const handlePurchase = async () => {
    const amount = parseFloat(customAmount);
    
    if (!customAmount || isNaN(amount)) {
      setError('Inserisci un importo valido');
      return;
    }

    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-gift-card-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      if (!url) {
        throw new Error("URL di pagamento non ricevuto");
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Si è verificato un errore";
      setError(message);
      toast({ 
        title: "Errore nel pagamento", 
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const amount = parseFloat(customAmount);
  const isValidAmount = customAmount && !isNaN(amount) && amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;

  return (
    <Card className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border-dashed border-2 border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-primary" />
          <span className="text-primary">Importo Personalizzato</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="custom-amount" className="text-sm font-medium">
            Inserisci l'importo desiderato
          </Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="custom-amount"
              type="text"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="pl-10 text-lg font-semibold"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Minimo €{MIN_AMOUNT} - Massimo €{MAX_AMOUNT}
          </p>
          {customAmount && (
            <p className={`text-xs ${isValidAmount ? 'text-green-600' : 'text-red-600'}`}>
              {isValidAmount ? `✓ Importo valido: €${amount}` : `✗ Importo non valido`}
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-3">
            Carta regalo valida per tutti i viaggi fotografici
          </p>
          
          <Button
            onClick={handlePurchase}
            disabled={!isValidAmount || isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Elaborazione...
              </>
            ) : (
              <>
                <Gift className="mr-2 h-4 w-4" />
                Acquista Ora
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomGiftCard;
