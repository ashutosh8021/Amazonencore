// Uploads product images to Supabase Storage and returns a public URL.
// Falls back to null if the bucket doesn't exist or storage isn't configured —
// the caller should fall back to a data URI in that case.
import { supabase } from './supabase.js'

const BUCKET = 'product-images'

export async function storeImage(base64, mediaType = 'image/jpeg') {
  if (!supabase || !base64) return null

  try {
    const ext = mediaType.split('/')[1] || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const buffer = Buffer.from(base64, 'base64')

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, { contentType: mediaType, upsert: false })

    if (error) {
      console.warn('[imageStorage] Upload failed, falling back to data URI:', error.message)
      return null
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename)
    return data.publicUrl
  } catch (err) {
    console.warn('[imageStorage] Error, falling back to data URI:', err.message)
    return null
  }
}
