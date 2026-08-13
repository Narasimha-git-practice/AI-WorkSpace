import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { User, Mail, Globe, Building, Lock, Camera, Sun, Moon, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const profileForm = useForm({
    defaultValues: { name: user?.name || '', bio: user?.bio || '', website: user?.website || '', company: user?.company || '' },
  })
  const passwordForm = useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>()

  const saveProfile = async (data: any) => {
    setSavingProfile(true)
    try {
      const res = await api.put('/auth/profile', data)
      updateUser(res.data.data)
      toast.success('Profile updated!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed')
    } finally { setSavingProfile(false) }
  }

  const changePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) return toast.error('Passwords do not match')
    setSavingPassword(true)
    try {
      await api.put('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Password changed successfully!')
      passwordForm.reset()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally { setSavingPassword(false) }
  }

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)
      const res = await api.post('/auth/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      updateUser({ avatar: res.data.data.avatar })
      toast.success('Avatar updated!')
    } catch { toast.error('Upload failed') }
    finally { setUploadingAvatar(false) }
  }

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'security', label: 'Security' },
    { key: 'preferences', label: 'Preferences' },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account information and preferences</p>
      </div>

      {/* Avatar */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">{user?.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
              {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
              <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} />
            </label>
          </div>
          <div>
            <p className="font-bold text-lg">{user?.name}</p>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <span className="badge badge-primary mt-1 capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
          <form onSubmit={profileForm.handleSubmit(saveProfile)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input {...profileForm.register('name', { required: true })} className="input-field pl-10" placeholder="Your name" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={user?.email} disabled className="input-field pl-10 opacity-60 cursor-not-allowed" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Bio</label>
              <textarea {...profileForm.register('bio')} className="textarea-field" rows={3} placeholder="Tell us about yourself..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input {...profileForm.register('website')} className="input-field pl-10" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Company</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input {...profileForm.register('company')} className="input-field pl-10" placeholder="Company name" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Change Password</h3>
          <form onSubmit={passwordForm.handleSubmit(changePassword)} className="space-y-4">
            {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field, i) => (
              <div key={field}>
                <label className="text-sm font-medium mb-1.5 block capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="password" {...passwordForm.register(field, { required: true, minLength: field !== 'currentPassword' ? { value: 6, message: 'Min 6 chars' } : undefined })} className="input-field pl-10" placeholder="••••••••" />
                </div>
              </div>
            ))}
            <button type="submit" disabled={savingPassword} className="btn-primary">
              {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Update Password
            </button>
          </form>
        </motion.div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="font-semibold mb-3">Theme</h3>
            <div className="flex gap-3">
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${theme === t ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent'}`}
                >
                  {t === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {t.charAt(0).toUpperCase() + t.slice(1)} Mode
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-border pt-5">
            <h3 className="font-semibold mb-1 text-destructive">Danger Zone</h3>
            <p className="text-xs text-muted-foreground mb-3">These actions are irreversible.</p>
            <button className="btn-danger text-sm">Delete Account</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
