import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registrati | WeShoot - Viaggi Fotografici',
  description: 'Crea il tuo account WeShoot e accedi a viaggi fotografici esclusivi, corsi di fotografia con professionisti e una community di fotografi appassionati.',
  keywords: ['registrazione', 'signup', 'weshoot', 'viaggi fotografici', 'corsi fotografia', 'community fotografi'],
  openGraph: {
    title: 'Registrati | WeShoot',
    description: 'Crea il tuo account e inizia la tua avventura fotografica con WeShoot.',
    type: 'website',
    locale: 'it_IT',
  },
  robots: {
    index: false, // Non indicizzare la pagina di registrazione
    follow: true,
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

