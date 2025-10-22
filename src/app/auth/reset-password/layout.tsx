import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reimposta Password | WeShoot',
  description: 'Imposta una nuova password per il tuo account WeShoot.',
  openGraph: {
    title: 'Reimposta Password | WeShoot',
    description: 'Imposta una nuova password per il tuo account WeShoot',
    type: 'website',
    locale: 'it_IT',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

