import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  createGalleryItem,
  deleteGalleryItem,
  fetchGalleryItems,
  fetchSiteSettings,
  reorderGalleryItems,
  saveSiteSettings,
  updateGalleryItem,
  uploadToStorage,
} from '../lib/siteContent'

const CATEGORIES = ['kitchens', 'furniture', 'others']

const DEFAULT_SETTINGS_FORM = {
  whatsapp_url: '',
  facebook_url: '',
  instagram_url: '',
  tiktok_url: '',
  address: '',
  phone: '',
  email: '',
  map_url: '',
}

const emptyUploadState = () => ({ files: [], previews: [], uploading: false })

export default function Admin() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('upload')
  const [settingsForm, setSettingsForm] = useState(DEFAULT_SETTINGS_FORM)
  const [allItems, setAllItems] = useState([])
  const [manageFilter, setManageFilter] = useState('all')
  const [mediaLoading, setMediaLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [toast, setToast] = useState({ type: '', message: '' })
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [savingOrder, setSavingOrder] = useState(false)
  const [desktopDnD, setDesktopDnD] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  )

  // Per-category upload state
  const [uploadStates, setUploadStates] = useState(
    Object.fromEntries(CATEGORIES.map((c) => [c, emptyUploadState()]))
  )

  useEffect(() => {
    loadAllItems()
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const fn = () => setDesktopDnD(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  async function loadAllItems() {
    setMediaLoading(true)
    try {
      const data = await fetchGalleryItems({ activeOnly: false })
      setAllItems(data)
    } catch {
      showToast('error', t('common.statusError'))
    } finally {
      setMediaLoading(false)
    }
  }

  async function loadSettings() {
    try {
      const settings = await fetchSiteSettings()
      setSettingsForm(settings)
    } catch {
      setSettingsForm(DEFAULT_SETTINGS_FORM)
    }
  }

  function showToast(type, message) {
    setToast({ type, message })
    setTimeout(() => setToast({ type: '', message: '' }), 3500)
  }

  function onFilesChange(category, event) {
    const files = Array.from(event.target.files || [])
    if (!files.length) return
    const previews = files.map((f) => URL.createObjectURL(f))
    setUploadStates((prev) => ({
      ...prev,
      [category]: { ...prev[category], files, previews },
    }))
  }

  function clearCategory(category) {
    setUploadStates((prev) => {
      prev[category].previews.forEach((url) => URL.revokeObjectURL(url))
      return { ...prev, [category]: emptyUploadState() }
    })
  }

  async function handleUpload(category) {
    const { files } = uploadStates[category]
    if (!files.length) return

    setUploadStates((prev) => ({
      ...prev,
      [category]: { ...prev[category], uploading: true },
    }))

    let successCount = 0
    for (const file of files) {
      try {
        const imageUrl = await uploadToStorage({ file, category })
        await createGalleryItem({
          category,
          image_url: imageUrl,
          alt_text: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          sort_order: 0,
          is_active: true,
        })
        successCount++
      } catch {
        showToast('error', t('admin.uploadError', { name: file.name }))
      }
    }

    setUploadStates((prev) => ({
      ...prev,
      [category]: { ...prev[category], uploading: false },
    }))
    clearCategory(category)

    if (successCount > 0) {
      showToast('success', t('admin.uploadedCount', { count: successCount }))
      loadAllItems()
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(t('admin.confirmDelete'))) return
    try {
      await deleteGalleryItem(item)
      showToast('success', t('admin.deleted'))
      setAllItems((prev) => prev.filter((i) => i.id !== item.id))
    } catch {
      showToast('error', t('common.statusError'))
    }
  }

  async function toggleActive(item) {
    try {
      const updated = await updateGalleryItem(item.id, { is_active: !item.is_active })
      setAllItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)))
    } catch {
      showToast('error', t('common.statusError'))
    }
  }

  function onSettingsChange(event) {
    const { name, value } = event.target
    setSettingsForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSettingsSave(event) {
    event.preventDefault()
    setSavingSettings(true)
    try {
      await saveSiteSettings(settingsForm)
      showToast('success', t('admin.saved'))
    } catch {
      showToast('error', t('common.statusError'))
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleSignOut() {
    // Navigate off /admin before auth clears, or ProtectedRoute sends users to /login.
    navigate('/', { replace: true })
    await signOut()
  }

  const filteredItems = allItems.filter(
    (item) => manageFilter === 'all' || item.category === manageFilter
  )

  function onDragStart(e, id) {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e, id) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== dragOverId) setDragOverId(id)
  }

  function onDragEnd() {
    setDragId(null)
    setDragOverId(null)
  }

  async function commitReorder(reordered) {
    const reorderedIds = reordered.map((i) => i.id)
    setAllItems((prev) => {
      const otherItems = prev.filter((i) => !reorderedIds.includes(i.id))
      const withNewOrder = reordered.map((item, idx) => ({ ...item, sort_order: idx }))
      return [...withNewOrder, ...otherItems].sort((a, b) => a.sort_order - b.sort_order)
    })

    setSavingOrder(true)
    try {
      await reorderGalleryItems(reordered)
    } catch {
      showToast('error', t('common.statusError'))
      loadAllItems()
    } finally {
      setSavingOrder(false)
    }
  }

  function moveFilteredItem(index, delta) {
    const newIndex = index + delta
    if (newIndex < 0 || newIndex >= filteredItems.length) return
    const reordered = [...filteredItems]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)
    commitReorder(reordered)
  }

  async function onDrop(e, targetId) {
    e.preventDefault()
    setDragOverId(null)
    if (!dragId || dragId === targetId) {
      setDragId(null)
      return
    }

    const fromIndex = filteredItems.findIndex((i) => i.id === dragId)
    const toIndex = filteredItems.findIndex((i) => i.id === targetId)
    if (fromIndex === -1 || toIndex === -1) {
      setDragId(null)
      return
    }

    const reordered = [...filteredItems]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)

    setDragId(null)
    if (fromIndex === toIndex) return
    await commitReorder(reordered)
  }

  return (
    <div className="min-h-screen bg-[#f1ece6] pb-14">
      {/* Header */}
      <header className="border-b border-[#d8cbbb] bg-[#191613] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#ac9880]">{t('admin.dashboard')}</p>
            <h1 className="mt-1 text-2xl">{t('admin.subtitle')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-[#bba68d] md:block">{user?.email}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-[#615445] px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors hover:border-[#b97964] hover:text-[#f0d9cc]"
            >
              {t('nav.signOut')}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
        {/* Tabs */}
        <div className="mb-7 flex flex-wrap gap-2 border-b border-[#d8cbbb] pb-3">
          {[
            { key: 'upload', label: t('admin.tabUpload') },
            { key: 'manage', label: t('admin.tabsManage') },
            { key: 'settings', label: t('admin.tabsSettings') },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] transition-all ${
                activeTab === tab.key
                  ? 'bg-[#b68f61] text-[#1d1711]'
                  : 'border border-[#d0c3b3] text-[#61574d] hover:border-[#b68f61]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toast */}
        {toast.message && (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
              toast.type === 'error'
                ? 'border-[#d4a6a6] bg-[#fff2f2] text-[#9b4949]'
                : 'border-[#b8d2b6] bg-[#f2fff1] text-[#466a45]'
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* ─── Upload Tab ─── */}
        {activeTab === 'upload' && (
          <div className="grid gap-6 md:grid-cols-3">
            {CATEGORIES.map((category) => {
              const state = uploadStates[category]
              return (
                <div key={category} className="soft-panel flex flex-col gap-5 p-6">
                  <div>
                    <h2 className="text-xl text-[#241e18]">{t(`admin.cat_${category}`)}</h2>
                    <p className="mt-1 text-xs text-[#7b7065]">{t(`admin.cat_${category}_desc`)}</p>
                  </div>

                  {/* Preview grid */}
                  {state.previews.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {state.previews.map((url, i) => (
                        <div key={i} className="aspect-square overflow-hidden rounded-xl bg-[#ede7e0]">
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Drop zone */}
                  <label
                    htmlFor={`upload-${category}`}
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#c8bdb0] bg-[#faf6f2] px-4 py-8 text-center transition-colors hover:border-[#b68f61]"
                  >
                    <span className="text-2xl">🖼</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7b7065]">
                      {t('admin.chooseImages')}
                    </span>
                    <span className="text-[10px] text-[#a09589]">{t('admin.multipleAllowed')}</span>
                    <input
                      id={`upload-${category}`}
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => onFilesChange(category, e)}
                    />
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!state.files.length || state.uploading}
                      onClick={() => handleUpload(category)}
                      className="flex-1 rounded-full bg-[#b78b58] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#1b140f] transition-colors hover:bg-[#c79a66] disabled:cursor-not-allowed disabled:bg-[#dbc9b4]"
                    >
                      {state.uploading
                        ? t('common.uploading')
                        : state.files.length > 0
                          ? t('admin.uploadCount', { count: state.files.length })
                          : t('admin.uploadCount', { count: 0 })}
                    </button>
                    {state.files.length > 0 && !state.uploading && (
                      <button
                        type="button"
                        onClick={() => clearCategory(category)}
                        className="rounded-full border border-[#d2c6b8] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#54493f]"
                      >
                        {t('common.cancel')}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ─── Manage Tab ─── */}
        {activeTab === 'manage' && (
          <section className="soft-panel p-6 md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl text-[#241e18]">{t('admin.tabsManage')}</h2>
              <div className="flex flex-wrap gap-2">
                {['all', ...CATEGORIES].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setManageFilter(val)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] transition-all ${
                      manageFilter === val
                        ? 'border-[#b68f61] bg-[#b68f61] text-[#1d1711]'
                        : 'border-[#d0c3b3] text-[#61574d] hover:border-[#b68f61]'
                    }`}
                  >
                    {val === 'all' ? t('gallery.all') : t(`admin.cat_${val}`)}
                  </button>
                ))}
              </div>
            </div>

            {savingOrder && (
              <p className="mb-3 text-xs text-[#7b7065] animate-pulse">{t('admin.savingOrder')}</p>
            )}

            {mediaLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse rounded-2xl bg-[#e6ded3]" />
                ))}
              </div>
            ) : !filteredItems.length ? (
              <p className="rounded-2xl border border-[#dfd2c3] bg-white/70 p-10 text-center text-[#7b7065]">
                {t('admin.noItems')}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {filteredItems.map((item, idx) => (
                  <article
                    key={item.id}
                    draggable={desktopDnD}
                    onDragStart={(e) => desktopDnD && onDragStart(e, item.id)}
                    onDragOver={(e) => desktopDnD && onDragOver(e, item.id)}
                    onDragEnd={onDragEnd}
                    onDrop={(e) => desktopDnD && onDrop(e, item.id)}
                    className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
                      desktopDnD ? 'cursor-grab active:cursor-grabbing' : ''
                    } ${
                      dragId === item.id
                        ? 'opacity-40 scale-95 border-[#b68f61]'
                        : dragOverId === item.id
                          ? 'border-[#b68f61] ring-2 ring-[#b68f61]/30 scale-[1.02]'
                          : 'border-[#dfd2c3]'
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#efe6db]">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.alt_text || ''}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#8d8379]">
                          {t('admin.noImage')}
                        </div>
                      )}
                      <span
                        className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] ${
                          item.is_active ? 'bg-[#d9f0d8] text-[#3d693c]' : 'bg-[#f0d9d9] text-[#864848]'
                        }`}
                      >
                        {t(`admin.cat_${item.category}`)}
                      </span>
                      {/* Drag handle (desktop) */}
                      {desktopDnD && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeWidth={2} d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
                          </svg>
                        </span>
                      )}
                      {/* Reorder on touch: HTML5 DnD is unreliable on mobile */}
                      <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 md:hidden">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveFilteredItem(idx, -1)
                          }}
                          disabled={idx === 0 || savingOrder}
                          title={t('admin.moveUp')}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/45 text-sm text-white backdrop-blur-sm disabled:opacity-35"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveFilteredItem(idx, 1)
                          }}
                          disabled={idx === filteredItems.length - 1 || savingOrder}
                          title={t('admin.moveDown')}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/45 text-sm text-white backdrop-blur-sm disabled:opacity-35"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1.5 p-2.5">
                      <button
                        type="button"
                        onClick={() => toggleActive(item)}
                        title={item.is_active ? t('common.enabled') : t('common.disabled')}
                        className={`flex-1 rounded-full border py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] transition-all ${
                          item.is_active
                            ? 'border-[#c8d4c8] text-[#466a45] hover:bg-[#f0fff0]'
                            : 'border-[#d9bcbc] text-[#864848] hover:bg-[#fff0f0]'
                        }`}
                      >
                        {item.is_active ? t('common.enabled') : t('common.disabled')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        title={t('admin.deleteItem')}
                        className="rounded-full border border-[#e2bcbc] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a35656]"
                      >
                        ✕
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── Settings Tab ─── */}
        {activeTab === 'settings' && (
          <form
            onSubmit={handleSettingsSave}
            className="soft-panel grid gap-5 p-6 md:grid-cols-2 md:p-8"
          >
            <h2 className="md:col-span-2 text-2xl text-[#241e18]">{t('admin.settingsTitle')}</h2>

            <InputField label={t('admin.whatsapp')} name="whatsapp_url" value={settingsForm.whatsapp_url} onChange={onSettingsChange} />
            <InputField label={t('admin.facebook')} name="facebook_url" value={settingsForm.facebook_url} onChange={onSettingsChange} />
            <InputField label={t('admin.instagram')} name="instagram_url" value={settingsForm.instagram_url} onChange={onSettingsChange} />
            <InputField label={t('admin.tiktok')} name="tiktok_url" value={settingsForm.tiktok_url} onChange={onSettingsChange} />
            <InputField label={t('admin.address')} name="address" value={settingsForm.address} onChange={onSettingsChange} />
            <InputField label={t('admin.phone')} name="phone" value={settingsForm.phone} onChange={onSettingsChange} />
            <InputField label={t('admin.email')} name="email" value={settingsForm.email} onChange={onSettingsChange} />
            <InputField label={t('admin.mapUrl')} name="map_url" value={settingsForm.map_url} onChange={onSettingsChange} />

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="rounded-full bg-[#b78b58] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#1b140f] transition-colors hover:bg-[#c79a66] disabled:cursor-not-allowed disabled:bg-[#dbc9b4]"
              >
                {savingSettings ? t('common.loading') : t('admin.saveSettings')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function InputField({ label, name, value, onChange, type = 'text' }) {
  return (
    <div>
      <label
        className="mb-1.5 block text-xs uppercase tracking-[0.24em] text-[#72665a]"
        htmlFor={name}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-[#d5c8b9] bg-white/85 px-4 py-3 text-[#2f2821] focus-ring"
      />
    </div>
  )
}
