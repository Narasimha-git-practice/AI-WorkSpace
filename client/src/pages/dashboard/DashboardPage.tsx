import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, CheckSquare, HardDrive, FolderOpen,
  Plus, ArrowRight, Clock, Mic
} from 'lucide-react'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/axios'
import StatCard from '@/components/shared/StatCard'
import { CardSkeleton, StatSkeleton } from '@/components/shared/Skeleton'
import { formatDateTime, truncate } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 11 } } },
  },
}

const quickActions = [
  { label: 'New Note',     icon: FileText,    path: '/notes',     color: 'bg-blue-500/10 text-blue-400' },
  { label: 'New Task',     icon: CheckSquare, path: '/tasks',     color: 'bg-emerald-500/10 text-emerald-400' },
  { label: 'Upload Doc',   icon: FolderOpen,  path: '/documents', color: 'bg-purple-500/10 text-purple-400' },
  { label: 'Voice Note',   icon: Mic,         path: '/voice',     color: 'bg-cyan-500/10 text-cyan-400' },
  { label: 'Files',        icon: HardDrive,   path: '/files',     color: 'bg-amber-500/10 text-amber-400' },
]

const STATUS_COLORS: Record<string, string> = {
  'todo': '#6366f1',
  'in-progress': '#f59e0b',
  'done': '#10b981',
}

const STATUS_LABELS: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard')
        setData(res.data.data)
      } catch {} finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Task status breakdown for doughnut chart
  const statusData = data?.taskStatusCounts || []
  const statusLabels = statusData.map((d: any) => STATUS_LABELS[d._id] || d._id)
  const statusValues = statusData.map((d: any) => d.count)
  const statusColors = statusData.map((d: any) => STATUS_COLORS[d._id] || '#6b7280')

  // Simple bar: notes, tasks, docs, files
  const statsBarData = {
    labels: ['Notes', 'Tasks', 'Documents', 'Files'],
    datasets: [{
      label: 'Count',
      data: [
        data?.stats?.notesCount || 0,
        data?.stats?.tasksCount || 0,
        data?.stats?.docsCount || 0,
        data?.stats?.filesCount || 0,
      ],
      backgroundColor: ['rgba(99,102,241,0.7)', 'rgba(16,185,129,0.7)', 'rgba(139,92,246,0.7)', 'rgba(245,158,11,0.7)'],
      borderRadius: 8,
    }],
  }

  return (
    <div className="space-y-8">
      {/* Welcome card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 gradient-bg opacity-5 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-sm mb-1">{getGreeting()},</p>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">{user?.name} 👋</h1>
            <p className="text-muted-foreground text-sm mt-2">
              You have <strong>{data?.stats?.tasksCount || 0}</strong> task boards and <strong>{data?.stats?.notesCount || 0}</strong> notes.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Total Notes"      value={data?.stats?.notesCount || 0} icon={FileText}    color="blue"   delay={0} />
            <StatCard title="Task Boards"      value={data?.stats?.tasksCount || 0} icon={CheckSquare} color="green"  delay={0.1} />
            <StatCard title="Documents"        value={data?.stats?.docsCount  || 0} icon={FolderOpen}  color="purple" delay={0.2} />
            <StatCard title="Files Stored"     value={data?.stats?.filesCount || 0} icon={HardDrive}   color="amber"  delay={0.3} />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {quickActions.map((action, i) => (
            <motion.div key={action.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link
                to={action.path}
                className="flex flex-col items-center gap-2 p-3 sm:p-4 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-glow-sm transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Content overview bar chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Content Overview</h3>
          {loading ? (
            <div className="h-40 shimmer rounded-xl" />
          ) : (
            <Bar data={statsBarData} options={chartOptions} height={160} />
          )}
        </div>

        {/* Task status doughnut */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Task Status</h3>
          {loading ? (
            <div className="h-40 shimmer rounded-xl" />
          ) : statusValues.length > 0 ? (
            <Doughnut
              data={{
                labels: statusLabels,
                datasets: [{ data: statusValues, backgroundColor: statusColors, borderWidth: 0 }],
              }}
              options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, color: '#6b7280', boxWidth: 12 } } } }}
              height={160}
            />
          ) : (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No tasks yet</div>
          )}
        </div>
      </div>

      {/* Recent items grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Notes */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Recent Notes</h3>
            <Link to="/notes" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : data?.recentNotes?.length ? (
            <div className="space-y-3">
              {data.recentNotes.slice(0, 4).map((note: any) => (
                <Link to="/notes" key={note._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{note.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {formatDateTime(note.updatedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No notes yet</p>
              <Link to="/notes" className="text-primary text-xs hover:underline mt-1 inline-flex items-center gap-1"><Plus className="w-3 h-3" />Create one</Link>
            </div>
          )}
        </div>

        {/* Recent Tasks */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Recent Tasks</h3>
            <Link to="/tasks" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : data?.recentTasks?.length ? (
            <div className="space-y-3">
              {data.recentTasks.slice(0, 4).map((task: any) => (
                <Link to="/tasks" key={task._id} className="block p-3 rounded-xl hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate flex-1">{truncate(task.goal, 40)}</p>
                    <span className={`badge ml-2 flex-shrink-0 ${task.priority === 'high' ? 'badge-danger' : task.priority === 'medium' ? 'badge-warning' : 'badge-muted'}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{task.progress}% complete</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No tasks yet</p>
              <Link to="/tasks" className="text-primary text-xs hover:underline mt-1 inline-flex items-center gap-1"><Plus className="w-3 h-3" />Create one</Link>
            </div>
          )}
        </div>

        {/* Recent Documents */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Recent Documents</h3>
            <Link to="/documents" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : data?.recentDocs?.length ? (
            <div className="space-y-3">
              {data.recentDocs.slice(0, 4).map((doc: any) => (
                <div key={doc._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.originalName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDateTime(doc.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No documents yet</p>
              <Link to="/documents" className="text-primary text-xs hover:underline mt-1 inline-flex items-center gap-1"><Plus className="w-3 h-3" />Upload one</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
