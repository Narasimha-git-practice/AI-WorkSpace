import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FileText, Pin, Archive, Trash2, Search, Tag, Grid, List, Loader2, X, Star } from 'lucide-react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import EmptyState from '@/components/shared/EmptyState'
import { CardSkeleton } from '@/components/shared/Skeleton'
import { formatDateTime, truncate, cn } from '@/lib/utils'

const NOTE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444']

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editNote, setEditNote] = useState<any>(null)
  const [form, setForm] = useState({ title: '', content: '', tags: '', color: '#6366f1' })
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pinned' | 'archived'>('all')

  const fetchNotes = useCallback(async () => {
    try {
      const params: any = {}
      if (search) params.search = search
      if (filter === 'pinned') params.isPinned = 'true'
      if (filter === 'archived') params.isArchived = 'true'
      else params.isArchived = 'false'

      const res = await api.get('/notes', { params })
      setNotes(res.data.data)
    } catch {
      toast.error('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }, [search, filter])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const openCreate = () => {
    setEditNote(null)
    setForm({ title: '', content: '', tags: '', color: '#6366f1' })
    setShowForm(true)
  }

  const openEdit = (note: any) => {
    setEditNote(note)
    setForm({ title: note.title, content: note.content, tags: note.tags?.join(', ') || '', color: note.color || '#6366f1' })
    setShowForm(true)
  }

  const saveNote = async () => {
    if (!form.title.trim()) return toast.error('Title is required')
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        content: form.content,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        color: form.color,
      }
      if (editNote) {
        await api.put(`/notes/${editNote._id}`, payload)
        toast.success('Note updated!')
      } else {
        await api.post('/notes', payload)
        toast.success('Note created!')
      }
      setShowForm(false)
      fetchNotes()
    } catch {
      toast.error('Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  const deleteNote = async (id: string) => {
    if (!confirm('Delete this note?')) return
    try {
      await api.delete(`/notes/${id}`)
      toast.success('Note deleted')
      fetchNotes()
    } catch { toast.error('Failed to delete') }
  }

  const togglePin = async (id: string) => {
    try {
      await api.post(`/notes/${id}/pin`)
      fetchNotes()
    } catch { toast.error('Failed') }
  }

  const toggleArchive = async (id: string) => {
    try {
      await api.post(`/notes/${id}/archive`)
      toast.success('Note archived')
      fetchNotes()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-muted-foreground text-sm">{notes.length} notes</p>
        </div>
        <button onClick={openCreate} className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'pinned', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn('btn-secondary capitalize text-sm px-3 py-2', filter === f && 'bg-primary text-primary-foreground border-primary')}
            >
              {f}
            </button>
          ))}
          <div className="border border-border rounded-xl flex">
            <button onClick={() => setView('grid')} className={cn('btn-icon rounded-r-none', view === 'grid' && 'bg-primary text-primary-foreground')}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setView('list')} className={cn('btn-icon rounded-l-none border-l border-border', view === 'list' && 'bg-primary text-primary-foreground')}><List className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Notes grid */}
      {loading ? (
        <div className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState icon={FileText} title="No notes yet" description="Create your first note to get started." action={<button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" />New Note</button>} />
      ) : (
        <div className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
          <AnimatePresence>
            {notes.map((note, i) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-glow-sm transition-all group relative"
                style={{ borderLeftColor: note.color, borderLeftWidth: 3 }}
              >
                {note.isPinned && <span className="absolute top-3 right-10 badge badge-primary"><Star className="w-3 h-3" /></span>}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-sm leading-snug flex-1">{note.title}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={() => openEdit(note)} className="btn-icon w-7 h-7" title="Edit"><FileText className="w-3.5 h-3.5" /></button>
                    <button onClick={() => togglePin(note._id)} className="btn-icon w-7 h-7" title="Pin"><Pin className="w-3.5 h-3.5" /></button>
                    <button onClick={() => toggleArchive(note._id)} className="btn-icon w-7 h-7" title="Archive"><Archive className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteNote(note._id)} className="btn-icon w-7 h-7 text-destructive hover:bg-destructive/10" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{truncate(note.content, view === 'grid' ? 120 : 200)}</p>
                {note.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        <Tag className="w-2.5 h-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{formatDateTime(note.updatedAt)}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">{editNote ? 'Edit Note' : 'Create Note'}</h2>
                <button onClick={() => setShowForm(false)} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Title</label>
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className="input-field"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Content (Markdown supported)</label>
                  <textarea
                    placeholder="Write your note here..."
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    className="textarea-field"
                    rows={8}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="work, ideas, important"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <div className="flex gap-2">
                    {NOTE_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((f) => ({ ...f, color: c }))}
                        className={cn('w-7 h-7 rounded-full border-2 transition-transform hover:scale-110', form.color === c ? 'border-white scale-110' : 'border-transparent')}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="btn-ghost ml-auto">Cancel</button>
                  <button onClick={saveNote} disabled={saving} className="btn-primary">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Note'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
