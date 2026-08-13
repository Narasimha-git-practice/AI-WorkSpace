import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Mic, Trash2, Loader2, StopCircle } from 'lucide-react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import EmptyState from '@/components/shared/EmptyState'
import { formatDateTime } from '@/lib/utils'

// Extend global Window for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function VoicePage() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [saving, setSaving] = useState(false)
  const [selectedNote, setSelectedNote] = useState<any>(null)
  const [title, setTitle] = useState('')
  const recognitionRef = useRef<any>(null)

  const fetchNotes = useCallback(async () => {
    try {
      const res = await api.get('/voice')
      setNotes(res.data.data)
    } catch { toast.error('Failed to load voice notes') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  // Use the browser's built-in Web Speech API for transcription
  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported. Please use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    let finalTranscript = transcript

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' '
        } else {
          interim += event.results[i][0].transcript
        }
      }
      setTranscript(finalTranscript + interim)
    }

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') toast.error(`Speech error: ${event.error}`)
      setIsRecording(false)
    }

    recognition.onend = () => setIsRecording(false)

    recognition.start()
    recognitionRef.current = recognition
    setIsRecording(true)
    toast.success('Recording started — speak now!')
  }

  const stopRecording = () => {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }

  // Save the transcription to MongoDB via the REST API
  const saveNote = async () => {
    if (!transcript.trim()) return toast.error('No transcript to save')
    if (!title.trim()) return toast.error('Please enter a title')
    setSaving(true)
    try {
      await api.post('/voice', { title, transcription: transcript, language: 'en-US' })
      toast.success('Voice note saved!')
      setTranscript('')
      setTitle('')
      fetchNotes()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const deleteNote = async (id: string) => {
    if (!confirm('Delete this voice note?')) return
    try {
      await api.delete(`/voice/${id}`)
      toast.success('Voice note deleted')
      if (selectedNote?._id === id) setSelectedNote(null)
      fetchNotes()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Voice to Text</h1>
        <p className="text-muted-foreground text-sm">
          Record your voice — the browser transcribes it in real-time, then save to your notes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recording panel */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
          {/* Record button */}
          <div className="flex flex-col items-center gap-4 py-4">
            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isRecording
                  ? 'bg-red-500 shadow-red-500/40 animate-pulse'
                  : 'gradient-bg shadow-primary/40 hover:shadow-primary/60'
              }`}
            >
              {isRecording ? <StopCircle className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
            </motion.button>
            <p className="text-sm font-medium">
              {isRecording ? (
                <span className="text-red-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Recording... Click to stop
                </span>
              ) : (
                'Click to start recording'
              )}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Uses browser Web Speech API · Best with Chrome or Edge
            </p>
          </div>

          {/* Title input */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Note Title</label>
            <input
              type="text"
              placeholder="Enter a title for this note..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Transcript */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium">Transcription</label>
              {transcript && (
                <button onClick={() => setTranscript('')} className="text-xs text-destructive hover:underline">
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your speech will appear here as you speak... You can also type or edit manually."
              className="textarea-field"
              rows={7}
            />
          </div>

          <button
            onClick={saveNote}
            disabled={saving || !transcript}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Voice Note'}
          </button>
        </div>

        {/* Saved notes list */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Saved Voice Notes ({notes.length})</h3>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 shimmer rounded-2xl" />)
          ) : notes.length === 0 ? (
            <EmptyState icon={Mic} title="No voice notes yet" description="Record your first voice note above." />
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {notes.map((note) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-card border rounded-2xl p-4 cursor-pointer transition-all ${
                    selectedNote?._id === note._id
                      ? 'border-primary shadow-glow-sm'
                      : 'border-border hover:border-primary/30'
                  }`}
                  onClick={() => setSelectedNote(selectedNote?._id === note._id ? null : note)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{note.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(note.createdAt)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNote(note._id) }}
                      className="btn-icon w-7 h-7 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{note.transcription}</p>

                  {/* Expanded transcription */}
                  {selectedNote?._id === note._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-border"
                    >
                      <p className="text-xs font-semibold mb-1">Full Transcription</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{note.transcription}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
