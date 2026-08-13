import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, FileText, CheckSquare, HardDrive,
  FolderOpen, BarChart3, Loader2, ShieldCheck, UserCheck, UserX
} from 'lucide-react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import StatCard from '@/components/shared/StatCard'
import { formatDateTime } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 10 } } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#6b7280', font: { size: 10 } } },
  },
}

export default function AdminPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== 'admin') { setLoading(false); return }
    const fetchAll = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
        ])
        setStats(statsRes.data.data)
        setUsers(usersRes.data.data)
      } catch { toast.error('Failed to load admin data') }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [user])

  const toggleUser = async (id: string) => {
    setTogglingId(id)
    try {
      await api.patch(`/admin/users/${id}/toggle`)
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isActive: !u.isActive } : u))
      toast.success('User status updated')
    } catch { toast.error('Failed to update user') }
    finally { setTogglingId(null) }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldCheck className="w-14 h-14 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground text-sm">You don't have permission to view this page.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  // Bar chart: content counts per type
  const contentBarData = {
    labels: ['Notes', 'Tasks', 'Documents', 'Files'],
    datasets: [{
      label: 'Total',
      data: [stats?.totalNotes || 0, stats?.totalTasks || 0, stats?.totalDocs || 0, stats?.totalFiles || 0],
      backgroundColor: ['rgba(99,102,241,0.7)', 'rgba(16,185,129,0.7)', 'rgba(139,92,246,0.7)', 'rgba(245,158,11,0.7)'],
      borderRadius: 8,
    }],
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Platform overview and user management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Total Users"     value={stats?.totalUsers || 0} icon={Users}       color="blue"   delay={0} />
        <StatCard title="Total Notes"     value={stats?.totalNotes || 0} icon={FileText}    color="purple" delay={0.05} />
        <StatCard title="Total Tasks"     value={stats?.totalTasks || 0} icon={CheckSquare} color="green"  delay={0.1} />
        <StatCard title="Documents"       value={stats?.totalDocs  || 0} icon={FolderOpen}  color="amber"  delay={0.15} />
        <StatCard title="Files Stored"    value={stats?.totalFiles || 0} icon={HardDrive}   color="cyan"   delay={0.2} />
      </div>

      {/* Content chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> Platform Content Overview
        </h3>
        <Bar data={contentBarData} options={chartOptions} height={150} />
      </div>

      {/* Recent Users Table */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-sm mb-4">Recent Registrations</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">User</th>
                <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">Email</th>
                <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">Role</th>
                <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">Joined</th>
                <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(stats?.recentUsers || []).map((u: any) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium truncate max-w-[120px]">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground truncate max-w-[160px]">{u.email}</td>
                  <td className="py-3">
                    <span className={`badge capitalize ${u.role === 'admin' ? 'badge-primary' : 'badge-muted'}`}>{u.role}</span>
                  </td>
                  <td className="py-3 text-muted-foreground text-xs whitespace-nowrap">{formatDateTime(u.createdAt)}</td>
                  <td className="py-3">
                    <span className={`badge ${u.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3">
                    {u._id !== user?._id && (
                      <button
                        onClick={() => toggleUser(u._id)}
                        disabled={togglingId === u._id}
                        className="flex items-center gap-1 text-xs btn-secondary py-1 px-2"
                      >
                        {togglingId === u._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : u.isActive !== false ? (
                          <><UserX className="w-3 h-3" /> Deactivate</>
                        ) : (
                          <><UserCheck className="w-3 h-3" /> Activate</>
                        )}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
