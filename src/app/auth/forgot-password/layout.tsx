import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Password Dimenticata | WeShoot',
  description: 'Recupera la tua password WeShoot. Ricevi un link di reimpostazione via email per accedere nuovamente al tuo account.',
  openGraph: {
    title: 'Password Dimenticata | WeShoot',
    description: 'Recupera la tua password WeShoot',
    type: 'website',
    locale: 'it_IT',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

