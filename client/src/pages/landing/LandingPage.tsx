import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, CheckSquare, Mic, HardDrive,
  FolderOpen, ArrowRight, Menu, X, Sun, Moon,
  Shield, ChevronDown, Briefcase
} from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

const features = [
  {
    icon: FileText,
    title: 'Notes',
    desc: 'Create, edit, pin, and archive notes with Markdown support. Organize with tags and colors.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: FolderOpen,
    title: 'Document Storage',
    desc: 'Upload PDF, DOCX, and TXT files. Text is extracted automatically for easy search.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: CheckSquare,
    title: 'Task Tracker',
    desc: 'Create task boards with subtasks, priorities, and deadlines. Track progress visually.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Mic,
    title: 'Voice to Text',
    desc: 'Record your voice and the browser transcribes it in real-time. Save notes hands-free.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: HardDrive,
    title: 'File Manager',
    desc: 'Upload, organize, and manage files with folder support, search, and quick download.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Shield,
    title: 'Secure Auth',
    desc: 'JWT-based authentication with password hashing (bcrypt), reset via email, and role management.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
]

const techStack = [
  { label: 'MongoDB', desc: 'NoSQL document database for all data storage', color: 'bg-green-500/10 text-green-400' },
  { label: 'Express.js', desc: 'REST API with clean route/controller/model structure', color: 'bg-yellow-500/10 text-yellow-400' },
  { label: 'React + Vite', desc: 'Fast frontend with TypeScript, Tailwind CSS, and Framer Motion', color: 'bg-blue-500/10 text-blue-400' },
  { label: 'Node.js', desc: 'Server runtime with JWT auth, Multer uploads, and Nodemailer', color: 'bg-emerald-500/10 text-emerald-400' },
]

const faqs = [
  {
    q: 'What is this project built with?',
    a: 'WorkSpace is a full-stack MERN project — MongoDB, Express.js, React (with TypeScript + Vite), and Node.js. It uses JWT for authentication and Multer for file uploads.',
  },
  {
    q: 'How does the Voice-to-Text feature work?',
    a: 'The browser\'s built-in Web Speech API captures and transcribes your speech in real-time. The transcription is then saved to MongoDB through the REST API.',
  },
  {
    q: 'How are files stored?',
    a: 'Files are stored on the server\'s local filesystem using Multer. MongoDB stores the file metadata (name, type, size, path). PDFs and DOCX files have their text extracted using pdf-parse and mammoth.',
  },
  {
    q: 'How is authentication handled?',
    a: 'Users register/login and receive a JWT token (stored in localStorage). Every protected API route verifies the token via a middleware. Passwords are hashed with bcrypt.',
  },
  {
    q: 'Is there a mobile-responsive UI?',
    a: 'Yes — the interface is fully responsive. The sidebar collapses on mobile, and all pages adapt to different screen sizes.',
  },
]

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg gradient-text">WorkSpace</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#stack" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Tech Stack</a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link to="/login" className="hidden md:inline-flex btn btn-ghost text-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary text-sm">Get Started</Link>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="btn-icon md:hidden">
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-card"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Features</a>
                <a href="#stack" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Tech Stack</a>
                <a href="#faq" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-32 pb-20 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4" />
              Full-Stack MERN Project
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold mb-6 leading-tight">
              Your Personal
              <span className="gradient-text"> WorkSpace</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              A clean MERN-stack productivity app — manage notes, tasks, documents, voice transcriptions, and files — all in one place with secure JWT auth.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn btn-primary px-8 py-3 text-base flex items-center gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn btn-ghost px-8 py-3 text-base">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Six core features built with clean code, proper structure, and MongoDB integration.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section id="stack" className="py-20 px-4 sm:px-6 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tech Stack</h2>
            <p className="text-muted-foreground text-lg">Built with the MERN stack — industry standard, well-documented, and easy to extend.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-5 text-center hover:border-primary/30 transition-all"
              >
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${tech.color}`}>
                  {tech.label}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Project structure highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-card border border-border rounded-2xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Project Structure
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm font-mono text-muted-foreground">
              <div>
                <p className="text-foreground font-semibold mb-2">📁 server/</p>
                <p className="pl-4">├── src/config/ &nbsp;&nbsp;&nbsp;(db, multer)</p>
                <p className="pl-4">├── src/models/ &nbsp;&nbsp;(User, Note, Task…)</p>
                <p className="pl-4">├── src/controllers/</p>
                <p className="pl-4">├── src/routes/</p>
                <p className="pl-4">├── src/middleware/ (auth, error)</p>
                <p className="pl-4">└── server.js</p>
              </div>
              <div>
                <p className="text-foreground font-semibold mb-2">📁 client/</p>
                <p className="pl-4">├── src/context/ &nbsp;(Auth, Theme)</p>
                <p className="pl-4">├── src/components/</p>
                <p className="pl-4">├── src/pages/ &nbsp;&nbsp;&nbsp;(Dashboard, Notes…)</p>
                <p className="pl-4">├── src/lib/ &nbsp;&nbsp;&nbsp;&nbsp;(axios, utils)</p>
                <p className="pl-4">└── App.tsx</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">FAQ</h2>
            <p className="text-muted-foreground text-lg">Common questions about the project.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-accent transition-colors"
                >
                  <span className="font-medium text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 ml-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-4 text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center bg-card border border-border rounded-3xl p-12 relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-bg opacity-5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Create your free account and explore all features — no credit card needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-primary px-8 py-3 text-base flex items-center gap-2 justify-center">
                Create Account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn btn-ghost px-8 py-3 text-base">
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-bg flex items-center justify-center">
              <Briefcase className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm gradient-text">WorkSpace</span>
          </div>
          <p className="text-muted-foreground text-xs">
            Built with MERN Stack · MongoDB · Express · React · Node.js
          </p>
        </div>
      </footer>
    </div>
  )
}
