import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Mail, Sparkles, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>()

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', data)
      setSent(true)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send email')
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
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-glass">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Check your email</h2>
              <p className="text-muted-foreground text-sm mb-6">We've sent you a password reset link. It expires in 30 minutes.</p>
              <Link to="/login" className="btn-primary justify-center w-full py-3">
                Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">Forgot password?</h1>
                <p className="text-muted-foreground text-sm">Enter your email and we'll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="forgot-email">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="you@example.com"
                      className="input-field pl-10"
                      {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3 rounded-xl">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
