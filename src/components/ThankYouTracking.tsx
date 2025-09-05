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
  transaction_id: string;
  value: number;
  currency: string;
  items: Item[];
};

export default function ThankYouTracking(props: { orderId?: string; value?: number }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // fallback: leggi da URL se non passati come prop
    const sp = new URLSearchParams(window.location.search);
    const orderId = props.orderId ?? sp.get('orderId') ?? 'unknown';
    const value = props.value ?? (Number(sp.get('value') ?? 0) || 0);

    // evita doppi invii
    const key = `purchase_sent_${orderId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    const payload: Purchase = {
      transaction_id: orderId,
      value,
      currency: 'EUR',
      items: [
        {
          item_id: 'deposit',
          item_name: 'Tour Deposit',
          price: value,
          quantity: 1,
          item_brand: 'WeShoot',
          item_category: 'Viaggi Fotografici',
        },
      ],
    };

    (window as any).dataLayer = (window as any).dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({ event: 'purchase', ecommerce: payload });
  }, [props.orderId, props.value]);

  return null;
}
