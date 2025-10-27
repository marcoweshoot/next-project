'use client'

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, 
  CheckCircle, 
  Mail, 
  Download, 
  Share2, 
  UserPlus, 
  CreditCard,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface GiftCardData {
  amount: number;
  code: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export function GiftCardSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [giftCard, setGiftCard] = useState<GiftCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      fetchGiftCardData();
    } else {
      setError('Sessione non trovata');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchGiftCardData = async () => {
    try {
      const response = await fetch(`/api/gift-cards/session/${sessionId}`);
      const data = await response.json();
      
      if (response.ok && data.giftCard) {
        setGiftCard(data.giftCard);
      } else {
        setError(data.error || 'Gift card non trovata');
      }
    } catch (err) {
      setError('Errore nel caricamento della gift card');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (giftCard?.code) {
      try {
        await navigator.clipboard.writeText(giftCard.code);
        setCopied(true);
        toast({
          title: "Codice copiato!",
          description: "Il codice gift card è stato copiato negli appunti",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Errore",
          description: "Impossibile copiare il codice"
        });
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento gift card...</p>
        </div>
      </div>
    );
  }

  if (error || !giftCard) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error || 'Gift card non trovata'}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          🎉 Gift Card Acquistata con Successo!
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          La tua gift card WeShoot è pronta! Ecco tutto quello che devi sapere per utilizzarla al meglio.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Gift Card Summary */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Gift className="w-8 h-8 text-primary" />
              La Tua Gift Card WeShoot
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-card/90 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
              <div className="text-4xl font-bold text-primary mb-2">
                {formatCurrency(giftCard.amount)}
              </div>
              <p className="text-muted-foreground mb-4">Valore della gift card</p>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-2">Codice Gift Card</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-2xl font-mono font-bold text-foreground bg-card border-2 border-primary/20 px-4 py-2 rounded">
                    {giftCard.code}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCode}
                    className="shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Valida fino al {formatDate(giftCard.expires_at)}</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {giftCard.status === 'active' ? 'Attiva' : giftCard.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="w-6 h-6 text-primary" />
              Cosa Succede Ora?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Email Notification */}
              <div className="flex gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Email di Conferma</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Riceverai una email con tutti i dettagli della gift card e le istruzioni per utilizzarla.
                  </p>
                </div>
              </div>

              {/* Digital Delivery */}
              <div className="flex gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Consegna Digitale</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Puoi condividere il codice digitalmente o stampare la gift card per regalarla.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Use Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CreditCard className="w-6 h-6 text-primary" />
              Come Utilizzare la Gift Card
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    1
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center justify-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Crea un Account
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Il destinatario deve creare un account su WeShoot.it
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    2
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center justify-center gap-2">
                      <Gift className="w-4 h-4" />
                      Registra la Gift Card
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Vai nella sezione "Gift Card" e inserisci il codice
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    3
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Prenota il Viaggio
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Scegli il tuo viaggio fotografico e paga con la gift card
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 dark:bg-muted/30 rounded-lg p-6 text-center border border-muted-foreground/20">
                <h4 className="font-semibold mb-2 text-foreground">💡 Suggerimento</h4>
                <p className="text-sm text-muted-foreground">
                  La gift card può essere utilizzata per qualsiasi viaggio fotografico WeShoot. 
                  Se il viaggio costa meno del valore della gift card, il saldo rimarrà disponibile per future prenotazioni.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <a href="/tours">
              <MapPin className="w-4 h-4 mr-2" />
              Esplora i Viaggi
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="/gift-card">
              <Gift className="w-4 h-4 mr-2" />
              Acquista Altre Gift Card
            </a>
          </Button>
        </div>

        {/* Support Section */}
        <Card className="bg-muted/30 dark:bg-muted/20 border border-muted-foreground/20">
          <CardContent className="pt-6 text-center">
            <h3 className="font-semibold mb-2 text-foreground">Hai bisogno di aiuto?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Il nostro team è qui per aiutarti con qualsiasi domanda sulla tua gift card.
            </p>
            <Button asChild variant="link" className="text-primary hover:text-primary/80">
              <a href="mailto:prenotazioni@weshoot.it">
                Contatta Supporto
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
