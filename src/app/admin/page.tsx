import { redirect } from 'next/navigation'

export default function AdminPage() {
  // Redirect alla pagina delle statistiche come default
  redirect('/admin/statistics')
}
