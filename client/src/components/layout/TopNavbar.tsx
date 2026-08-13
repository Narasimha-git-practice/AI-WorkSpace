import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sun, Moon, Bell, Menu, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

interface TopNavbarProps {
  setMobileOpen: (v: boolean) => void
  collapsed: boolean
}

export default function TopNavbar({ setMobileOpen, collapsed }: TopNavbarProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const sidebarWidth = collapsed ? 64 : 240

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-card/80 backdrop-blur-md border-b border-border z-20 flex items-center px-4 gap-3 transition-all duration-200"
      style={{ left: `${sidebarWidth}px` }}
    >
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="btn-icon md:hidden"
        id="mobile-menu-btn"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search everything... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            id="global-search-input"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          id="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Notifications (placeholder) */}
        <button className="btn-icon relative" id="notifications-btn">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-accent transition-all"
            id="profile-dropdown-btn"
          >
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">{user?.name?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <span className="text-sm font-medium hidden sm:block">{user?.name?.split(' ')[0]}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { navigate('/profile'); setDropdownOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                  >
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => { navigate('/profile'); setDropdownOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left"
                  >
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </button>
                </div>
                <div className="py-1 border-t border-border">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                    id="logout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
