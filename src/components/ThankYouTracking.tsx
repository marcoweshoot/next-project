// components/ThankYouTracking.tsx
'use client';

import { useEffect } from 'react';

const ThankYouTracking = () => {
  useEffect(() => {
    // Google Analytics ecommerce
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        currencyCode: 'EUR',
        items: [
          {
            name: 'Tour Deposit',
            id: 0,
            price: 100,
            brand: 'WeShoot',
            category: 'Viaggi Fotografici',
          },
        ],
      },
    });

    // Facebook Pixel
    if ((window as any).fbq != null) {
      (window as any).fbq('track', 'Purchase', {
        value: 100,
        currency: 'EUR',
        content_type: 'product',
        content_ids: 0,
      });
    }
  }, []);

  return null;
};

export default ThankYouTracking;
