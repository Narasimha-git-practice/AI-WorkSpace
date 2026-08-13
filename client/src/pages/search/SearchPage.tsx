import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, FileText, CheckSquare, Mail, HardDrive, Sparkles, Loader2 } from 'lucide-react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { formatDateTime, truncate } from '@/lib/utils'

const TAB_CONFIG = [
  { key: 'notes', label: 'Notes', icon: FileText, path: '/notes', color: 'text-blue-400' },
  { key: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks', color: 'text-emerald-400' },
  { key: 'emails', label: 'Emails', icon: Mail, path: '/email', color: 'text-amber-400' },
  { key: 'files', label: 'Files', icon: HardDrive, path: '/files', color: 'text-purple-400' },
  { key: 'history', label: 'AI History', icon: Sparkles, path: '/history', color: 'text-pink-400' },
]

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('notes')

  const performSearch = async (q: string) => {
    if (!q.trim() || q.length < 2) return
    setLoading(true)
    try {
      const res = await api.get('/search', { params: { q } })
      setResults(res.data.data)
      // Set first tab with results as active
      const first = TAB_CONFIG.find((t) => (res.data.data[t.key]?.length || 0) > 0)
      if (first) setActiveTab(first.key)
    } catch { toast.error('Search failed') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); performSearch(q) }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query)
  }

  const activeResults = results?.[activeTab] || []

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Global Search</h1>
        <p className="text-muted-foreground text-sm">Search across all your notes, tasks, emails, files, and AI history</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search everything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field pl-11 py-3 text-base"
            autoFocus
          />
        </div>
        <button type="submit" disabled={loading || !query.trim()} className="btn-primary px-6 py-3">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </form>

      {results && (
        <div>
          {/* Tab bar */}
          <div className="flex flex-wrap gap-2 mb-5">
            {TAB_CONFIG.map((tab) => {
              const count = results[tab.key]?.length || 0
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border transition-all ${activeTab === tab.key ? 'bg-primary text-white border-primary' : 'border-border hover:bg-accent'}`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.key ? 'text-white' : tab.color}`} />
                  {tab.label}
                  {count > 0 && <span className={`text-xs px-1.5 rounded-full ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>{count}</span>}
                </button>
              )
            })}
          </div>

          {/* Results */}
          {activeResults.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No {activeTab} found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeResults.map((item: any, i: number) => {
                const tabConfig = TAB_CONFIG.find((t) => t.key === activeTab)!
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={tabConfig.path}
                      className="flex items-start gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-glow-sm transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <tabConfig.icon className={`w-4 h-4 ${tabConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {item.title || item.goal || item.subject || item.originalName || truncate(item.prompt, 60)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {truncate(item.content || item.body || item.transcription || item.response || '', 100)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(item.createdAt || item.updatedAt)}</p>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!results && !loading && (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium mb-1">Search everything</p>
          <p className="text-sm">Type at least 2 characters to search across notes, tasks, emails, files, and AI history</p>
        </div>
      )}
    </div>
  )
}
