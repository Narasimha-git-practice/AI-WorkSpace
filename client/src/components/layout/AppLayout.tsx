import { useState } from 'react'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarWidth = collapsed ? 64 : 240

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main content area - offset by sidebar on desktop */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-200"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? `${sidebarWidth}px` : 0 }}
      >
        <TopNavbar setMobileOpen={setMobileOpen} collapsed={collapsed} />
        <main className="flex-1 pt-16">
          <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
