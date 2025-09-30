// Configurazione per upload immagini
export interface UploadConfig {
  maxSize: number // in bytes
  allowedTypes: string[]
  transformations?: {
    width?: number
    height?: number
    quality?: number
    format?: string
  }
}

export const PROFILE_IMAGE_CONFIG: UploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  transformations: {
    width: 400,
    height: 400,
    quality: 85,
    format: 'auto'
  }
}

// Funzione per validare file
export function validateImageFile(file: File, config: UploadConfig): { valid: boolean; error?: string } {
  // Controlla dimensione
  if (file.size > config.maxSize) {
    return { valid: false, error: `File troppo grande. Massimo ${config.maxSize / 1024 / 1024}MB` }
  }

  // Controlla tipo
  if (!config.allowedTypes.includes(file.type)) {
    return { valid: false, error: `Tipo file non supportato. Usa: ${config.allowedTypes.join(', ')}` }
  }

  return { valid: true }
}

// Funzione per ridimensionare immagine
export function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calcola dimensioni mantenendo proporzioni
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Disegna immagine ridimensionata
      ctx?.drawImage(img, 0, 0, width, height)

      // Converti in blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Errore nella conversione immagine'))
        }
      }, 'image/jpeg', 0.85)
    }

    img.onerror = () => reject(new Error('Errore nel caricamento immagine'))
    img.src = URL.createObjectURL(file)
  })
}

// Funzione per upload a Cloudinary
export async function uploadToCloudinary(file: File, userId: string): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  formData.append('folder', `weshoot/profiles/${userId}`)
  formData.append('transformation', 'w_400,h_400,c_fill,g_face,q_auto,f_auto')

  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('Errore nel caricamento su Cloudinary')
  }

  const data = await response.json()
  return data.secure_url
}

// Funzione per upload a Supabase Storage
export async function uploadToSupabaseStorage(file: File, userId: string, supabase: any): Promise<string> {
  // Gestisci il caso in cui file.name sia undefined o non abbia estensione
  const fileName = file.name || 'profile-image'
  const fileExt = fileName.includes('.') ? fileName.split('.').pop() : 'jpg'
  const finalFileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `profiles/${finalFileName}`

  try {
    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Errore upload Supabase: ${error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    // Se il bucket non esiste, fallback a data URL temporaneo
    console.warn('Supabase Storage non configurato, usando data URL temporaneo:', error)
    return await fileToDataURL(file)
  }
}

// Funzione helper per convertire file in data URL
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        resolve(result)
      } else {
        reject(new Error('Errore nella conversione file'))
      }
    }
    reader.onerror = () => reject(new Error('Errore nella lettura file'))
    reader.readAsDataURL(file)
  })
}

// Funzione principale per upload
export async function uploadProfileImage(
  file: File, 
  userId: string, 
  supabase: any,
  useCloudinary: boolean = false
): Promise<string> {
  // Valida file
  const validation = validateImageFile(file, PROFILE_IMAGE_CONFIG)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  try {
    // Ridimensiona immagine
    const resizedFile = await resizeImage(file, 400, 400)

    // Upload
    if (useCloudinary) {
      return await uploadToCloudinary(resizedFile, userId)
    } else {
      return await uploadToSupabaseStorage(resizedFile, userId, supabase)
    }
  } catch (error) {
    // Fallback: usa data URL se upload fallisce
    console.warn('Upload fallito, usando data URL:', error)
    return await fileToDataURL(file)
  }
}
