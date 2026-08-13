import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CheckSquare, Trash2, Loader2, X, ChevronDown, ChevronUp } from 'lucide-react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import EmptyState from '@/components/shared/EmptyState'
import { CardSkeleton } from '@/components/shared/Skeleton'
import { cn, formatDate } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  'todo': 'bg-muted text-muted-foreground',
  'in-progress': 'bg-amber-500/10 text-amber-500',
  'done': 'bg-emerald-500/10 text-emerald-500',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({
    goal: '',
    deadline: '',
    priority: 'medium',
    tasks: [] as { title: string; description: string; priority: string; status: string }[],
  })
  const [newItem, setNewItem] = useState({ title: '', description: '', priority: 'medium' })

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks')
      setTasks(res.data.data)
    } catch { toast.error('Failed to load tasks') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const addTaskItem = () => {
    if (!newItem.title.trim()) return toast.error('Task title is required')
    setForm((f) => ({
      ...f,
      tasks: [...f.tasks, { ...newItem, status: 'todo' }],
    }))
    setNewItem({ title: '', description: '', priority: 'medium' })
  }

  const removeTaskItem = (index: number) => {
    setForm((f) => ({ ...f, tasks: f.tasks.filter((_, i) => i !== index) }))
  }

  const createTask = async () => {
    if (!form.goal.trim()) return toast.error('Goal is required')
    setSaving(true)
    try {
      await api.post('/tasks', {
        goal: form.goal,
        deadline: form.deadline || undefined,
        priority: form.priority,
        tasks: form.tasks,
      })
      toast.success('Task board created!')
      setShowCreate(false)
      setForm({ goal: '', deadline: '', priority: 'medium', tasks: [] })
      fetchTasks()
    } catch { toast.error('Failed to create task') }
    finally { setSaving(false) }
  }

  const updateTaskItem = async (taskId: string, taskItemId: string, status: string) => {
    try {
      await api.patch(`/tasks/${taskId}/items/${taskItemId}`, { status })
      fetchTasks()
    } catch { toast.error('Update failed') }
  }

  const toggleSubtask = async (taskId: string, taskItemId: string, subtaskIndex: number, completed: boolean) => {
    try {
      await api.patch(`/tasks/${taskId}/items/${taskItemId}`, { subtaskIndex, completed })
      fetchTasks()
    } catch { toast.error('Update failed') }
  }

  const deleteTask = async (id: string) => {
    if (!confirm('Delete this task board?')) return
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted')
      fetchTasks()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Task Tracker</h1>
          <p className="text-muted-foreground text-sm">Create task boards, track progress, and manage subtasks</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Task Board
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No task boards yet"
          description="Create your first task board to start tracking your goals."
          action={<button onClick={() => setShowCreate(true)} className="btn-primary"><Plus className="w-4 h-4" />New Task Board</button>}
        />
      ) : (
        <div className="space-y-5">
          {tasks.map((task, i) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{task.goal}</h3>
                    <span className={cn('badge', task.priority === 'high' ? 'badge-danger' : task.priority === 'medium' ? 'badge-warning' : 'badge-muted')}>{task.priority}</span>
                  </div>
                  {task.deadline && <p className="text-xs text-muted-foreground mt-1">📅 Due {formatDate(task.deadline)}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 max-w-xs bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{task.progress}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setExpandedId(expandedId === task._id ? null : task._id)}
                    className="btn-secondary text-xs"
                  >
                    {expandedId === task._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {task.tasks?.length || 0} tasks
                  </button>
                  <button onClick={() => deleteTask(task._id)} className="btn-icon text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === task._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="p-5">
                      <div className="grid gap-3">
                        {task.tasks?.map((item: any) => (
                          <div key={item._id} className="border border-border rounded-xl p-4">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-medium text-sm">{item.title}</h4>
                                  <span className={cn('badge text-xs', STATUS_COLORS[item.status])}>{item.status}</span>
                                  <span className={cn('badge text-xs', item.priority === 'high' ? 'badge-danger' : item.priority === 'medium' ? 'badge-warning' : 'badge-muted')}>{item.priority}</span>
                                </div>
                                {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                                {item.estimatedTime && <p className="text-xs text-muted-foreground mt-0.5">⏱ {item.estimatedTime}</p>}
                              </div>
                              <select
                                value={item.status}
                                onChange={(e) => updateTaskItem(task._id, item._id, e.target.value)}
                                className="text-xs bg-background border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary flex-shrink-0"
                              >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                              </select>
                            </div>
                            {item.subtasks?.length > 0 && (
                              <div className="space-y-1.5 mt-2 pl-3 border-l-2 border-border">
                                {item.subtasks.map((sub: any, j: number) => (
                                  <label key={j} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={sub.completed}
                                      onChange={(e) => toggleSubtask(task._id, item._id, j, e.target.checked)}
                                      className="w-3.5 h-3.5 rounded accent-primary"
                                    />
                                    <span className={cn('text-xs', sub.completed && 'line-through text-muted-foreground')}>{sub.title}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        {task.tasks?.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No task items yet.</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Task Board Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">New Task Board</h2>
                <button onClick={() => setShowCreate(false)} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Goal / Title</label>
                  <textarea
                    placeholder="e.g. Build a personal portfolio website"
                    value={form.goal}
                    onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                    className="textarea-field"
                    rows={2}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Deadline</label>
                    <input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Priority</label>
                    <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))} className="input-field">
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Add task items */}
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium">Add Task Items</p>
                  <input
                    type="text"
                    placeholder="Task item title..."
                    value={newItem.title}
                    onChange={(e) => setNewItem((n) => ({ ...n, title: e.target.value }))}
                    className="input-field"
                    onKeyDown={(e) => e.key === 'Enter' && addTaskItem()}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newItem.description}
                      onChange={(e) => setNewItem((n) => ({ ...n, description: e.target.value }))}
                      className="input-field text-sm"
                    />
                    <select value={newItem.priority} onChange={(e) => setNewItem((n) => ({ ...n, priority: e.target.value }))} className="input-field text-sm">
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <button onClick={addTaskItem} className="btn-secondary w-full justify-center text-sm">
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>

                  {form.tasks.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {form.tasks.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 text-sm bg-accent rounded-lg px-3 py-2">
                          <span className="truncate">{item.title}</span>
                          <button onClick={() => removeTaskItem(idx)} className="text-destructive hover:opacity-80 flex-shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowCreate(false)} className="btn-ghost">Cancel</button>
                  <button onClick={createTask} disabled={saving} className="btn-primary flex-1 justify-center">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Create Board</>}
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
