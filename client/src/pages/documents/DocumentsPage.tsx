import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Trash2, Sparkles, Loader2, X, ChevronDown, ChevronUp, Download } from 'lucide-react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import EmptyState from '@/components/shared/EmptyState'
import { CardSkeleton } from '@/components/shared/Skeleton'
import { formatDateTime, formatFileSize } from '@/lib/utils'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [summarizing, setSummarizing] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await api.get('/documents')
      setDocuments(res.data.data)
    } catch { toast.error('Failed to load documents') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxSize: 25 * 1024 * 1024,
    onDrop: async (files) => {
      if (!files[0]) return
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('document', files[0])
        await api.post('/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Document uploaded!')
        fetchDocuments()
      } catch { toast.error('Upload failed') }
      finally { setUploading(false) }
    },
  })

  const summarize = async (id: string) => {
    setSummarizing(id)
    try {
      await api.post(`/documents/${id}/summarize`)
      toast.success('Document summarized!')
      fetchDocuments()
      setExpandedId(id)
    } catch { toast.error('Summarization failed') }
    finally { setSummarizing(null) }
  }

  const downloadDoc = (doc: any) => {
    const link = document.createElement('a')
    link.href = doc.fileData || doc.fileUrl
    link.download = doc.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const deleteDoc = async (id: string) => {
    if (!confirm('Delete this document?')) return
    try {
      await api.delete(`/documents/${id}`)
      toast.success('Document deleted')
      fetchDocuments()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Document Summarizer</h1>
          <p className="text-muted-foreground text-sm">Upload PDF, DOCX, or TXT — AI extracts key insights</p>
        </div>
      </div>

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/30'}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-medium">Uploading & processing...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Drag & drop your document here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse — PDF, DOCX, TXT up to 10MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Documents list */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : documents.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" description="Upload a PDF, DOCX, or TXT file to get started." />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {documents.map((doc, i) => (
              <motion.div
                key={doc._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{doc.originalName}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)} · {formatDateTime(doc.createdAt)}</p>
                      {doc.readingTime && <p className="text-xs text-primary mt-0.5">📖 {doc.readingTime} read</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!doc.isProcessed ? (
                      <span className="badge badge-warning">Processing failed</span>
                    ) : doc.summary ? (
                      <button
                        onClick={() => setExpandedId(expandedId === doc._id ? null : doc._id)}
                        className="btn-secondary text-xs"
                      >
                        {expandedId === doc._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {expandedId === doc._id ? 'Hide' : 'View'} Summary
                      </button>
                    ) : (
                      <button
                        onClick={() => summarize(doc._id)}
                        disabled={summarizing === doc._id}
                        className="btn-primary text-xs"
                      >
                        {summarizing === doc._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        Summarize
                      </button>
                    )}
                    <button onClick={() => downloadDoc(doc)} title="Download file from DB" className="btn-icon text-muted-foreground hover:text-foreground hover:bg-accent">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteDoc(doc._id)} className="btn-icon text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === doc._id && doc.summary && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Summary</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{doc.summary}</p>
                        </div>
                        <div className="space-y-4">
                          {doc.keyPoints?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">📌 Key Points</h4>
                              <ul className="space-y-1">
                                {doc.keyPoints.map((p: string, j: number) => (
                                  <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <span className="text-primary mt-0.5">•</span> {p}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {doc.keywords?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">🔑 Keywords</h4>
                              <div className="flex flex-wrap gap-1">
                                {doc.keywords.map((k: string) => <span key={k} className="badge badge-primary">{k}</span>)}
                              </div>
                            </div>
                          )}
                          {doc.actionItems?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm mb-2">✅ Action Items</h4>
                              <ul className="space-y-1">
                                {doc.actionItems.map((a: string, j: number) => (
                                  <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                                    <span className="text-emerald-500">→</span> {a}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
