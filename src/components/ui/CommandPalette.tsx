import { ArrowRight, Check, Copy, CornerDownLeft, Download, Languages, Moon, Play, Search, Send, Sun, type LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { profile } from '../../data/profile'
import { visibleProjects } from '../../data/projects'
import { demoPath, hasDemo } from '../../demos/registry'
import { useCopyEmail } from '../../hooks/useCopyEmail'
import { useLanguage } from '../../i18n/context'
import { useTheme } from '../../theme/context'
import { lockScroll } from '../../lib/scroll'
import { navItems } from '../sections/navItems'

/** Fired by the header's search button; the palette also opens on ⌘K / Ctrl+K and "/". */
export const OPEN_PALETTE = 'palette:open'

type Group = 'goTo' | 'projects' | 'demos' | 'actions'

interface Command {
  id: string
  group: Group
  label: string
  /** Extra text matched by the search but not shown (the other language's title, the stack). */
  keywords: string
  icon: LucideIcon
  /** Keep the palette open after running (used by copy, so its confirmation is visible). */
  stay?: boolean
  run: () => void
}

const groupOrder: Group[] = ['goTo', 'projects', 'demos', 'actions']

/** Keyboard-first launcher: jump to a section, open a project or demo, or switch language and theme. */
export function CommandPalette() {
  const { t, lang, toggleLang } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { status, copy } = useCopyEmail()
  const navigate = useNavigate()
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const uid = useId()

  const commands = useMemo<Command[]>(() => {
    const other = lang === 'en' ? 'ar' : 'en'
    const out: Command[] = navItems.map((n) => ({ id: `go-${n.id}`, group: 'goTo', label: t(n.key), keywords: n.id, icon: ArrowRight, run: () => navigate(n.to) }))
    for (const p of visibleProjects) {
      out.push({ id: `p-${p.id}`, group: 'projects', label: p.title[lang], keywords: `${p.title[other]} ${p.technologies.join(' ')} ${p.category}`, icon: ArrowRight, run: () => navigate(`/projects/${p.id}`) })
    }
    for (const p of visibleProjects.filter((x) => hasDemo(x.id))) {
      out.push({ id: `d-${p.id}`, group: 'demos', label: p.title[lang], keywords: `${p.title[other]} demo تجربة`, icon: Play, run: () => navigate(demoPath(p.id)) })
    }
    out.push(
      { id: 'a-lang', group: 'actions', label: t('header.language'), keywords: 'language arabic english العربية لغة', icon: Languages, run: toggleLang },
      { id: 'a-theme', group: 'actions', label: theme === 'dark' ? t('header.themeToLight') : t('header.themeToDark'), keywords: 'theme dark light mode الوضع', icon: theme === 'dark' ? Sun : Moon, run: toggleTheme },
      { id: 'a-copy', group: 'actions', label: status === 'copied' ? t('header.copied') : status === 'failed' ? t('header.copyFailed') : t('header.copyEmail'), keywords: 'email mail بريد', icon: status === 'copied' ? Check : Copy, stay: true, run: () => void copy() },
    )
    if (profile.cvFile) {
      const file = profile.cvFile
      out.push({ id: 'a-cv', group: 'actions', label: t('hero.downloadCv'), keywords: 'cv resume سيرة', icon: Download, run: () => window.open(file, '_blank', 'noopener') })
    }
    if (profile.telegram) {
      const url = profile.telegram
      out.push({ id: 'a-telegram', group: 'actions', label: 'Telegram', keywords: 'telegram chat message تيليجرام', icon: Send, run: () => window.open(url, '_blank', 'noopener') })
    }
    return out
  }, [t, lang, theme, status, navigate, toggleLang, toggleTheme, copy])

  const results = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return commands
    return commands.filter((c) => {
      const hay = `${c.label} ${c.keywords}`.toLowerCase()
      return words.every((w) => hay.includes(w))
    })
  }, [commands, query])

  const active = Math.min(index, Math.max(results.length - 1, 0))

  const close = useCallback(() => dialog.current?.close(), [])

  // Open on ⌘K / Ctrl+K anywhere, on "/" outside text fields, and from the header button.
  useEffect(() => {
    const show = () => setOpen(true)
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
        return
      }
      const el = e.target as HTMLElement | null
      const typing = el?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el?.tagName ?? '')
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        show()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_PALETTE, show)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_PALETTE, show)
    }
  }, [])

  // The native modal dialog supplies the focus trap, Escape and the inert page behind.
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      input.current?.focus()
      return lockScroll()
    }
    if (!open && el.open) el.close()
  }, [open])

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, results])

  const run = (c: Command | undefined) => {
    if (!c) return
    c.run()
    if (!c.stay) close()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex(results.length ? (active + 1) % results.length : 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex(results.length ? (active - 1 + results.length) % results.length : 0)
    } else if (e.key === 'Home') {
      e.preventDefault()
      setIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setIndex(results.length - 1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      run(results[active])
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-label={t('palette.label')}
      onClose={() => {
        setOpen(false)
        setQuery('')
        setIndex(0)
      }}
      onClick={(e) => e.target === e.currentTarget && close()}
      className="palette themed mx-auto mt-[12svh] w-[min(38rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-[1.75rem] bg-surface p-0 text-text"
    >
      <div className="flex items-center gap-3 border-b border-hairline px-5">
        <Search className="size-[18px] shrink-0 text-text-2" aria-hidden="true" />
        <input
          ref={input}
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={`${uid}-list`}
          aria-activedescendant={results[active] ? `${uid}-${results[active].id}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIndex(0)
          }}
          onKeyDown={onKeyDown}
          placeholder={t('palette.placeholder')}
          className="h-14 min-w-0 grow bg-transparent text-[17px] text-text outline-none placeholder:text-text-2"
        />
        <kbd className="latin t-fine hidden rounded-full bg-chip px-1.5 py-0.5 text-text-2 sm:block">esc</kbd>
      </div>

      <div ref={list} id={`${uid}-list`} role="listbox" aria-label={t('palette.label')} data-lenis-prevent className="max-h-[min(24rem,52svh)] overflow-y-auto overscroll-contain p-2">
        {results.length === 0 && <p className="px-3 py-8 text-center text-text-2">{t('palette.empty')}</p>}
        {groupOrder.map((group) => {
          const items = results.filter((c) => c.group === group)
          if (!items.length) return null
          return (
            <div key={group} role="group" aria-label={t(`palette.groups.${group}`)}>
              <p className="t-fine px-3 pb-1 pt-3 font-semibold text-text-2" aria-hidden="true">
                {t(`palette.groups.${group}`)}
              </p>
              {items.map((c) => {
                const selected = results[active]?.id === c.id
                const Icon = c.icon
                return (
                  <div
                    key={c.id}
                    id={`${uid}-${c.id}`}
                    role="option"
                    aria-selected={selected}
                    onPointerMove={() => !selected && setIndex(results.indexOf(c))}
                    onClick={() => run(c)}
                    className={`flex h-11 cursor-pointer items-center gap-3 rounded-full px-3 ${selected ? 'bg-accent text-on-accent' : 'text-text'}`}
                  >
                    <Icon className={`size-4 shrink-0 rtl:-scale-x-100 ${selected ? '' : 'text-text-2'}`} aria-hidden="true" />
                    <span className="min-w-0 grow truncate" dir="auto">
                      {c.label}
                    </span>
                    {selected && <CornerDownLeft className="size-4 shrink-0 opacity-80 rtl:-scale-x-100" aria-hidden="true" />}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <p className="t-fine hidden items-center gap-4 border-t border-hairline px-5 py-2.5 text-text-2 sm:flex" aria-hidden="true">
        <span>
          <kbd className="latin">↑↓</kbd> {t('palette.hints.move')}
        </span>
        <span>
          <kbd className="latin">↵</kbd> {t('palette.hints.open')}
        </span>
        <span className="grow" />
        <kbd className="latin" dir="ltr">
          ⌘K
        </kbd>
      </p>
    </dialog>
  )
}
