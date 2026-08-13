import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Lock, Sparkles, Loader2, Eye, EyeOff } from 'lucide-react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

interface ResetForm {
  password: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>()
  const password = watch('password')

  const onSubmit = async (data: ResetForm) => {
    setIsLoading(true)
    try {
      await api.put(`/auth/reset-password/${token}`, { password: data.password })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Reset failed. Link may be expired.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl gradient-bg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl gradient-text">WorkSpace</span>
          </Link>
          <h1 className="text-2xl font-bold mb-1">Reset your password</h1>
          <p className="text-muted-foreground text-sm">Enter your new password below.</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-glass">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="reset-password">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  className="input-field pl-10 pr-10"
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="reset-confirm">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="reset-confirm"
                  type="password"
                  placeholder="••••••••"
                  className="input-field pl-10"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === password || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3 rounded-xl">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">Back to Sign In</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
