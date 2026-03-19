import { supabase } from './supabase'

export const MEDIA_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET || 'media'

export const DEFAULT_SITE_SETTINGS = {
  whatsapp_url: '',
  facebook_url: '',
  instagram_url: '',
  tiktok_url: '',
  address: 'Lipjan, Kosovo',
  phone: '+383 44 000 000',
  email: 'info@artdekor.com',
  map_url: '',
}

function buildStoragePath(category, fileName) {
  const extension = fileName.includes('.') ? fileName.split('.').pop() : 'jpg'
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  return `${category}/${stamp}.${extension}`
}

export function getStoragePathFromUrl(publicUrl) {
  if (!publicUrl) return null
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`
  const index = publicUrl.indexOf(marker)
  if (index === -1) return null
  return publicUrl.slice(index + marker.length)
}

export async function uploadToStorage({ file, category }) {
  if (!file) return null
  const filePath = buildStoragePath(category, file.name)
  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(filePath, file, { upsert: false })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(filePath)
  return data?.publicUrl || ''
}

export async function removeStorageFile(publicUrl) {
  const storagePath = getStoragePathFromUrl(publicUrl)
  if (!storagePath) return
  await supabase.storage.from(MEDIA_BUCKET).remove([storagePath])
}

/**
 * Fetch gallery items.
 * - Pass category='kitchens'|'furniture'|'others' to filter by category.
 * - Omit category (or pass 'all') to fetch all items (used by slideshow).
 */
export async function fetchGalleryItems({ category, activeOnly = true } = {}) {
  let query = supabase
    .from('gallery_items')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createGalleryItem(payload) {
  const { data, error } = await supabase
    .from('gallery_items')
    .insert([payload])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateGalleryItem(id, payload) {
  const { data, error } = await supabase
    .from('gallery_items')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function reorderGalleryItems(orderedItems) {
  const updates = orderedItems.map((item, i) =>
    supabase.from('gallery_items').update({ sort_order: i }).eq('id', item.id)
  )
  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) throw failed.error
}

export async function deleteGalleryItem(item) {
  const { error } = await supabase.from('gallery_items').delete().eq('id', item.id)
  if (error) throw error
  await removeStorageFile(item.image_url)
}

export async function fetchSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return { ...DEFAULT_SITE_SETTINGS, ...(data || {}) }
}

export async function saveSiteSettings(values) {
  const payload = {
    id: 1,
    whatsapp_url: values.whatsapp_url || '',
    facebook_url: values.facebook_url || '',
    instagram_url: values.instagram_url || '',
    tiktok_url: values.tiktok_url || '',
    address: values.address || '',
    phone: values.phone || '',
    email: values.email || '',
    map_url: values.map_url || '',
  }

  const { data, error } = await supabase
    .from('site_settings')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return data
}

// ---------------------------------------------------------------------------
// Legacy aliases – kept so any remaining references don't break at import time.
// These can be removed once all pages are updated.
// ---------------------------------------------------------------------------
export const fetchMediaItems = fetchGalleryItems
export const createMediaItem = createGalleryItem
export const updateMediaItem = updateGalleryItem
export const deleteMediaItem = deleteGalleryItem
