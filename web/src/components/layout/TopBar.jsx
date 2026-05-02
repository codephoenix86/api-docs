import { Link, useParams } from 'react-router-dom'
import clsx from 'clsx'
import { Github, Menu, Monitor, MoonStar, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme.js'
import { ApiSwitcher } from '@/components/nav/ApiSwitcher.jsx'
import { SearchTrigger } from '@/components/search/SearchTrigger.jsx'
import { getRegistry } from '@/lib/spec/load.js'

export function TopBar({ onOpenMobileNav, onOpenSearch }) {
  const { api: slug } = useParams()
  const registry = getRegistry()
  const cur = registry.find((r) => r.slug === slug)
  const repoUrl = cur?.repo ?? 'https://github.com/'

  const { theme, cycleTheme } = useTheme()
  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? MoonStar : Monitor

  return (
    <header
      className={clsx(
        'sticky top-0 z-30 h-14 flex items-center gap-3 px-3 sm:px-5',
        'bg-[color:color-mix(in_oklab,var(--color-bg)_85%,transparent)] backdrop-blur',
        'border-b border-[color:var(--color-border)]',
      )}
    >
      <button
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="lg:hidden -ml-1 rounded-md p-1.5 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]"
      >
        <Menu size={18} />
      </button>

      <Link to="/" className="flex items-center gap-2 font-semibold">
        <span
          className="inline-flex items-center justify-center size-7 rounded-md text-white text-sm font-bold"
          style={{ background: 'var(--color-brand)' }}
          aria-hidden
        >
          A
        </span>
        <span className="hidden sm:inline text-[14px]">API Docs</span>
      </Link>

      {slug && (
        <>
          <span className="text-[color:var(--color-text-muted)]/50 select-none" aria-hidden>/</span>
          <ApiSwitcher currentSlug={slug} />
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        <SearchTrigger onClick={onOpenSearch} />
        <a
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub repository"
          className="hidden sm:inline-flex items-center justify-center size-9 rounded-md text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:color-mix(in_oklab,var(--color-text)_6%,transparent)]"
        >
          <Github size={16} />
        </a>
        <button
          type="button"
          onClick={cycleTheme}
          aria-label={`Theme: ${theme}`}
          title={`Theme: ${theme} (click to cycle)`}
          className="inline-flex items-center justify-center size-9 rounded-md text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] hover:bg-[color:color-mix(in_oklab,var(--color-text)_6%,transparent)]"
        >
          <ThemeIcon size={16} />
        </button>
      </div>
    </header>
  )
}
