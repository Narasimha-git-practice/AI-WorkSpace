import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Upload, HardDrive, Trash2, Star, Folder, Grid, List, Search, Loader2, Pencil, X, Check, Download } from 'lucide-react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import EmptyState from '@/components/shared/EmptyState'
import { formatDateTime, formatFileSize, getFileIcon, cn } from '@/lib/utils'

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [activeFolder, setActiveFolder] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const fetchAll = useCallback(async () => {
    try {
      const params: any = {}
      if (search) params.search = search
      if (activeFolder) params.folder = activeFolder
      const [filesRes, foldersRes] = await Promise.all([
        api.get('/files', { params }),
        api.get('/files/folders'),
      ])
      setFiles(filesRes.data.data)
      setFolders(['Root', ...foldersRes.data.data.filter((f: string) => f !== 'Root')])
    } catch { toast.error('Failed to load files') }
    finally { setLoading(false) }
  }, [search, activeFolder])

  useEffect(() => { fetchAll() }, [fetchAll])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxSize: 25 * 1024 * 1024,
    onDrop: async (acceptedFiles) => {
      if (!acceptedFiles[0]) return
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', acceptedFiles[0])
        fd.append('folder', activeFolder || 'Root')
        await api.post('/files', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('File uploaded!')
        fetchAll()
      } catch { toast.error('Upload failed') }
      finally { setUploading(false) }
    },
  })

  const downloadFile = (file: any) => {
    const link = document.createElement('a')
    link.href = file.fileData || file.fileUrl
    link.download = file.originalName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const deleteFile = async (id: string) => {
    if (!confirm('Delete this file?')) return
    try {
      await api.delete(`/files/${id}`)
      toast.success('File deleted')
      fetchAll()
    } catch { toast.error('Failed') }
  }

  const toggleStar = async (id: string) => {
    try {
      await api.post(`/files/${id}/star`)
      fetchAll()
    } catch {}
  }

  const renameFile = async (id: string) => {
    if (!renameValue.trim()) return
    try {
      await api.patch(`/files/${id}/rename`, { name: renameValue })
      toast.success('File renamed')
      setRenamingId(null)
      fetchAll()
    } catch { toast.error('Rename failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">File Manager</h1>
          <p className="text-muted-foreground text-sm">{files.length} files</p>
        </div>
        <div {...getRootProps()} className="cursor-pointer">
          <input {...getInputProps()} />
          <button className="btn-primary">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload File
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('grid')} className={cn('btn-icon', view === 'grid' && 'bg-primary text-primary-foreground')}><Grid className="w-4 h-4" /></button>
          <button onClick={() => setView('list')} className={cn('btn-icon', view === 'list' && 'bg-primary text-primary-foreground')}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Folders */}
      {folders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveFolder('')} className={cn('btn-secondary text-xs', !activeFolder && 'bg-primary text-primary-foreground border-primary')}>
            All Files
          </button>
          {folders.map((folder) => (
            <button key={folder} onClick={() => setActiveFolder(activeFolder === folder ? '' : folder)}
              className={cn('btn-secondary text-xs flex items-center gap-1.5', activeFolder === folder && 'bg-primary text-primary-foreground border-primary')}>
              <Folder className="w-3.5 h-3.5" />{folder}
            </button>
          ))}
        </div>
      )}

      {/* Drop zone when no files */}
      {!loading && files.length === 0 && !search && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/30'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Drop files here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">Up to 10MB per file</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className={cn('grid gap-4', view === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1')}>
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 shimmer rounded-2xl" />)}
        </div>
      ) : files.length === 0 && (search || activeFolder) ? (
        <EmptyState icon={HardDrive} title="No files found" description="Try a different search term or folder." />
      ) : files.length > 0 ? (
        <div className={cn('grid gap-3', view === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1')}>
          <AnimatePresence>
            {files.map((file, i) => (
              <motion.div
                key={file._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-glow-sm transition-all group',
                  view === 'list' && 'flex items-center gap-4'
                )}
              >
                <div className={cn('flex-shrink-0', view === 'grid' ? 'text-3xl mb-3' : 'text-2xl')}>
                  {getFileIcon(file.mimeType)}
                </div>
                <div className={cn('min-w-0 flex-1', view === 'grid' ? '' : '')}>
                  {renamingId === file._id ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') renameFile(file._id); if (e.key === 'Escape') setRenamingId(null) }}
                        className="input-field text-xs py-1 px-2"
                        autoFocus
                      />
                      <button onClick={() => renameFile(file._id)} className="btn-icon w-6 h-6 text-emerald-500"><Check className="w-3 h-3" /></button>
                      <button onClick={() => setRenamingId(null)} className="btn-icon w-6 h-6"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <p className="text-xs font-medium truncate">{file.originalName}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.fileSize)}</p>
                  {view === 'list' && <p className="text-xs text-muted-foreground">{formatDateTime(file.createdAt)}</p>}
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleStar(file._id)} className="btn-icon w-6 h-6">
                      <Star className={cn('w-3.5 h-3.5', file.isStarred ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground')} />
                    </button>
                    <button onClick={() => { setRenamingId(file._id); setRenameValue(file.originalName) }} className="btn-icon w-6 h-6">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => downloadFile(file)} title="Download file" className="btn-icon w-6 h-6 text-muted-foreground hover:text-foreground">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteFile(file._id)} className="btn-icon w-6 h-6 text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  )
}
