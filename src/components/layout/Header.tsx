'use client'

import { useTheme } from '@/components/providers/ThemeProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useDebounce } from '@/hooks/useDebounce'
import { NAVIGATION_LINKS, TOOLS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Command, Github, Heart, Menu, Moon, Search, Sun, X, Zap } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)

  const filteredTools = React.useMemo(() => {
    if (!debouncedSearch) return []
    return TOOLS.filter(
      tool =>
        tool.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tool.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        tool.keywords.some(keyword => keyword.toLowerCase().includes(debouncedSearch.toLowerCase()))
    ).slice(0, 5)
  }, [debouncedSearch])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className=" mx-auto container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:scale-105 transition-transform"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white">
              <Zap className="h-4 w-4" />
            </div>
            <span className="hidden font-bold sm:inline-block gradient-text">DevTools Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {NAVIGATION_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative transition-colors hover:text-foreground/80 hover:scale-105',
                  pathname === link.href ? 'text-foreground' : 'text-foreground/60'
                )}
              >
                {link.name}
                {pathname === link.href && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary animate-scale-in" />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <Button
              variant="outline"
              size="sm"
              className="relative hidden md:flex items-center space-x-2 w-64 justify-start text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span>Search tools...</span>
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <Command className="h-3 w-3" />K
              </kbd>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <Button variant="outline" size="icon" onClick={toggleTheme} className="hover:scale-105">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* GitHub */}
            <Link href="https://github.com/devtools-hub" target="_blank">
              <Button variant="outline" size="icon" className="hover:scale-105">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t bg-background md:hidden animate-fade-in-down">
            <nav className="container mx-auto py-4 space-y-2">
              {NAVIGATION_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                    pathname === link.href
                      ? 'bg-accent text-accent-foreground'
                      : 'text-foreground/60'
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-2 border-t">
                <Link
                  href="https://github.com/devtools-hub"
                  target="_blank"
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  <Github className="h-4 w-4" />
                  <span>Star on GitHub</span>
                  <Heart className="h-3 w-3 text-red-500" />
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 animate-fade-in">
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 animate-scale-in">
            <div className="bg-background border rounded-lg shadow-lg p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {filteredTools.length > 0 && (
                <div className="space-y-1">
                  {filteredTools.map(tool => (
                    <Link
                      key={tool.id}
                      href={tool.path}
                      className="flex items-center space-x-3 rounded-md p-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                      onClick={() => {
                        setIsSearchOpen(false)
                        setSearchQuery('')
                      }}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        <span className="text-xs font-medium text-primary">
                          {tool.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-xs text-muted-foreground">{tool.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {searchQuery && filteredTools.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No tools found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
