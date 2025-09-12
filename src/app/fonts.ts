// app/fonts.ts
import { Inter, Montserrat } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  // scegli solo i pesi che usi davvero
  weight: ['400', '600', '700'],
});

export const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['400', '600', '700'],
});
