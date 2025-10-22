import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accedi | WeShoot - Viaggi Fotografici',
  description: 'Accedi al tuo account WeShoot per gestire le tue prenotazioni ai viaggi fotografici, visualizzare i corsi di fotografia e accedere alla dashboard personale.',
  keywords: ['login', 'accedi', 'weshoot', 'viaggi fotografici', 'corsi fotografia', 'account'],
  openGraph: {
    title: 'Accedi | WeShoot',
    description: 'Accedi al tuo account WeShoot per gestire le tue prenotazioni e viaggi fotografici.',
    type: 'website',
    locale: 'it_IT',
  },
  robots: {
    index: false, // Non indicizzare la pagina di login
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

