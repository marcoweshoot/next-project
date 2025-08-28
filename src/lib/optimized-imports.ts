// src/lib/optimized-imports.ts
// Importazioni ottimizzate per ridurre il bundle JavaScript
// Questo file centralizza le importazioni più pesanti

import { createElement, type ComponentType } from 'react';
import dynamic from 'next/dynamic';

// Icons - importazione selettiva
export const Icons = {
  MapPin: () => import('lucide-react').then(m => ({ default: m.MapPin })),
  Users: () => import('lucide-react').then(m => ({ default: m.Users })),
  Star: () => import('lucide-react').then(m => ({ default: m.Star })),
  Search: () => import('lucide-react').then(m => ({ default: m.Search })),
  ChevronDown: () => import('lucide-react').then(m => ({ default: m.ChevronDown })),
  Calendar: () => import('lucide-react').then(m => ({ default: m.Calendar })),
  Camera: () => import('lucide-react').then(m => ({ default: m.Camera })),
};

// Componenti UI - lazy loading
export const UIComponents = {
  Button: () => import('@/components/ui/button').then(m => ({ default: m.Button })),
  Input: () => import('@/components/ui/input').then(m => ({ default: m.Input })),
  Dialog: () => import('@/components/ui/dialog').then(m => ({ default: m.Dialog })),
  Carousel: () => import('@/components/ui/carousel').then(m => ({ default: m.Carousel })),
  Accordion: () => import('@/components/ui/accordion').then(m => ({ default: m.Accordion })),
};

// Componenti di business - lazy loading
export const BusinessComponents = {
  TourCard: () => import('@/components/tour-card/TourCard').then(m => ({ default: m.default })),
  TourDetail: () => import('@/components/tour-detail/TourDetailContentClient').then(m => ({ default: m.default })),
  GalleryLightbox: () => import('@/components/tour-detail/gallery/GalleryLightbox').then(m => ({ default: m.default })),
};

// Utilità per il lazy loading
// Nota: niente JSX in un file .ts; usiamo createElement
export const createLazyComponent = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
) =>
  dynamic(importFn, {
    loading: () => createElement('div', { className: 'animate-pulse bg-gray-200 rounded' }),
    ssr: true,
  });
