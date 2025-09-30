'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { uploadProfileImage } from '@/lib/image-upload'
import { 
  Upload, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface ProfilePictureUploadProps {
  currentImageUrl?: string
  firstName?: string
  lastName?: string
  userId: string
  onImageChange: (url: string) => Promise<void>
}

export function ProfilePictureUpload({ 
  currentImageUrl, 
  firstName, 
  lastName, 
  userId,
  onImageChange 
}: ProfilePictureUploadProps) {
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError(null)
      setSuccess(null)

      // Upload professionale con ridimensionamento
      const uploadedUrl = await uploadProfileImage(file, userId, supabase, false)
      
      setImageUrl(uploadedUrl)
      onImageChange(uploadedUrl)
      setSuccess('Immagine caricata con successo!')
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Errore nel caricamento del file')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async () => {
    try {
      setUploading(true)
      setError(null)
      setSuccess(null)
      
      setImageUrl('')
      await onImageChange('')
      setSuccess('Immagine rimossa con successo!')
    } catch (err) {
      setError('Errore nella rimozione dell\'immagine')
    } finally {
      setUploading(false)
    }
  }

  const getInitials = () => {
    const first = firstName?.[0] || ''
    const last = lastName?.[0] || ''
    return (first + last).toUpperCase()
  }

  return (
    <div className="space-y-4">
      {/* Preview Avatar */}
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={imageUrl || undefined} alt="Foto profilo" />
          <AvatarFallback className="text-lg">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Upload className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploading ? 'Caricando...' : 'Carica File'}
            </Button>
            
            {imageUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeImage}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                {uploading ? 'Rimuovendo...' : 'Rimuovi'}
              </Button>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            JPG, PNG, GIF, WebP (max 5MB)
          </p>
        </div>
      </div>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />


      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• La foto apparirà nelle tue recensioni e nel profilo pubblico</p>
        <p>• L'immagine verrà automaticamente ridimensionata a 400x400px</p>
        <p>• Formati supportati: JPG, PNG, GIF, WebP</p>
        <p>• Dimensione massima: 5MB</p>
      </div>
    </div>
  )
}
