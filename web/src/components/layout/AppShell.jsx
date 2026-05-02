import { useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { TopBar } from './TopBar.jsx'
import { Sidebar } from './Sidebar.jsx'
import { MobileNav } from './MobileNav.jsx'
import { Footer } from './Footer.jsx'
import { SearchDialog } from '@/components/search/SearchDialog.jsx'
import { useApi } from '@/hooks/useApi.js'
import { useHashScroll } from '@/hooks/useHashScroll.js'
import { useGlobalSearchShortcut } from '@/components/search/SearchTrigger.jsx'

/**
 * Two layouts:
 * - When inside an API route (`/:api/...`): top bar + sidebar + content + footer.
 * - When at the home route (`/`): top bar + content + footer (no sidebar).
 */
export function AppShell() {
  const { api: slug } = useParams()
  const { api } = useApi()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  useHashScroll()
  useGlobalSearchShortcut(() => setSearchOpen(true))

  const hasSidebar = Boolean(slug)

  return (
    <div className="min-h-full flex flex-col">
      <TopBar
        onOpenMobileNav={() => setMobileOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {hasSidebar ? (
        <div className="flex-1 mx-auto w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-[17.5rem_minmax(0,1fr)] gap-0">
          <aside
            className="hidden lg:block sticky top-14 self-start h-[calc(100vh-3.5rem)] border-r border-[color:var(--color-border)]"
            aria-label="Documentation navigation"
          >
            <Sidebar api={api} />
          </aside>
          <main className="min-w-0 px-4 sm:px-6 lg:px-10 py-8">
            <Outlet />
            <Footer version={api?.version} />
          </main>
        </div>
      ) : (
        <main className="flex-1 mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-10 py-10">
          <Outlet />
          <Footer />
        </main>
      )}

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} api={api} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
