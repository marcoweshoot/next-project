"use client";

import { useEffect } from 'react';

export const useTourAnalytics = (tour: any) => {
  useEffect(() => {
    if (tour && tour.sessions?.[0]) {
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push({
          event: 'view_item',
          ecommerce: {
            currencyCode: 'EUR',
            items: [{
              name: tour.title,
              id: tour.id,
              price: tour.price,
              brand: 'WeShoot',
              category: 'Viaggi Fotografici',
            }],
          },
        });
      }
    }
  }, [tour]);
};
