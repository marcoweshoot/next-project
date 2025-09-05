// components/ThankYouTracking.tsx
'use client';
import { useEffect } from 'react';

type Item = {
  item_id: string | number;
  item_name: string;
  price: number;
  quantity: number;
  item_brand?: string;
  item_category?: string;
};

type Purchase = {
  transaction_id: string;   // un ID univoco (ordine)
  value: number;            // totale ordine
  currency: string;         // es. 'EUR'
  items: Item[];
};

export default function ThankYouTracking({
  orderId,
  value = 100,
}: {
  orderId: string;          // passalo dalla tua thank-you page
  value?: number;
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // evita doppi invii ricaricando la thank-you
    const key = `purchase_sent_${orderId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    const payload: Purchase = {
      transaction_id: orderId,
      value,
      currency: 'EUR',
      items: [
        {
          item_id: 'deposit',              // ID prodotto
          item_name: 'Tour Deposit',
          price: value,
          quantity: 1,
          item_brand: 'WeShoot',
          item_category: 'Viaggi Fotografici',
        },
      ],
    };

    // GA4 e Pixel passeranno da GTM: spingiamo SOLO nel dataLayer
    (window as any).dataLayer = (window as any).dataLayer || [];
    window.dataLayer.push({ ecommerce: null });       // pulizia precedente
    window.dataLayer.push({ event: 'purchase', ecommerce: payload });
  }, [orderId, value]);

  return null;
}
