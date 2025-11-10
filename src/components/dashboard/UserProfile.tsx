'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProfilePictureUpload } from '@/components/dashboard/ProfilePictureUpload'
import { DeleteAccountButton } from '@/components/dashboard/DeleteAccountButton'
import { 
  User, 
  Phone, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  MapPin,
  Calendar,
  CreditCard,
  Camera
} from 'lucide-react'

interface Profile {
  id: string
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  birth_date?: string
  fiscal_code?: string
  email?: string
  mobile_phone?: string
  profile_picture_url?: string
  created_at: string
  updated_at: string
}

interface UserProfileProps {
  userId: string
}

export function UserProfile({ userId }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    birth_date: '',
    fiscal_code: '',
    email: '',
    mobile_phone: '',
    profile_picture_url: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error
        }

        if (data) {
          setProfile(data)
          setFormData({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            phone: data.phone || '',
            address: data.address || '',
            birth_date: data.birth_date || '',
            fiscal_code: data.fiscal_code || '',
            email: data.email || '',
            mobile_phone: data.mobile_phone || '',
            profile_picture_url: data.profile_picture_url || '',
          })
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Errore nel caricamento del profilo')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Prepara i dati per il salvataggio, escludendo campi che potrebbero non esistere ancora
      const profileData: any = {
        id: userId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      }

      // Aggiungi solo i campi che esistono nel database
      if (formData.address) profileData.address = formData.address
      if (formData.birth_date) profileData.birth_date = formData.birth_date
      if (formData.fiscal_code) profileData.fiscal_code = formData.fiscal_code
      if (formData.email) profileData.email = formData.email
      if (formData.mobile_phone) profileData.mobile_phone = formData.mobile_phone
      if (formData.profile_picture_url) profileData.profile_picture_url = formData.profile_picture_url

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData)

      if (error) throw error

      setSuccess('✅ Profilo aggiornato con successo!')
      
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 5000)
      
      // Refresh profile data
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (data) {
        setProfile(data)
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio del profilo')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Salvataggio automatico per la foto profilo
  const handleImageChange = async (url: string) => {
    setFormData(prev => ({
      ...prev,
      profile_picture_url: url
    }))

    // Salva automaticamente nel database
    try {
      const profileData: any = {
        id: userId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        profile_picture_url: url,
      }

      // Aggiungi solo i campi che esistono nel database
      if (formData.address) profileData.address = formData.address
      if (formData.birth_date) profileData.birth_date = formData.birth_date
      if (formData.fiscal_code) profileData.fiscal_code = formData.fiscal_code
      if (formData.email) profileData.email = formData.email
      if (formData.mobile_phone) profileData.mobile_phone = formData.mobile_phone

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData)

      if (error) {
        console.error('Errore nel salvataggio automatico:', error)
        setError('Errore nel salvataggio della foto profilo')
      } else {
        // Profile picture saved successfully
      }
    } catch (err) {
      console.error('Errore nel salvataggio automatico:', err)
      setError('Errore nel salvataggio della foto profilo')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200 font-medium">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Foto Profilo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Foto Profilo
          </CardTitle>
          <CardDescription>
            La tua foto apparirà nelle recensioni e nel profilo pubblico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfilePictureUpload
            currentImageUrl={formData.profile_picture_url}
            firstName={formData.first_name}
            lastName={formData.last_name}
            userId={userId}
            onImageChange={handleImageChange}
          />
        </CardContent>
      </Card>

      {/* Informazioni Personali */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informazioni personali
          </CardTitle>
          <CardDescription>
            Aggiorna le tue informazioni personali
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nome *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Il tuo nome"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Cognome *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Il tuo cognome"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo di residenza</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Via, Città, CAP, Provincia"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birth_date">Data di nascita</Label>
                <Input
                  id="birth_date"
                  value={formData.birth_date}
                  onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  type="date"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fiscal_code">Codice Fiscale</Label>
                <Input
                  id="fiscal_code"
                  value={formData.fiscal_code}
                  onChange={(e) => handleInputChange('fiscal_code', e.target.value.toUpperCase())}
                  placeholder="RSSMRA80A01H501U"
                  maxLength={16}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="tua@email.com"
                  type="email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobile_phone">Cellulare</Label>
                <Input
                  id="mobile_phone"
                  value={formData.mobile_phone}
                  onChange={(e) => handleInputChange('mobile_phone', e.target.value)}
                  placeholder="+39 123 456 7890"
                  type="tel"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefono fisso</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Il tuo numero di telefono fisso"
                type="tel"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Salvando...' : 'Salva modifiche'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Sezione Cancellazione Account */}
      <DeleteAccountButton />

    </div>
  )
}
