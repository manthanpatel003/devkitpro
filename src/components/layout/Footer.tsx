'use client'

import { SOCIAL_LINKS, TOOLS, TOOL_CATEGORIES } from '@/lib/constants'
import { ExternalLink, Github, Heart, Linkedin, Mail, Twitter, Zap } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const popularTools = TOOLS.filter(tool => tool.popular).slice(0, 6)
  const recentTools = TOOLS.filter(tool => tool.new).slice(0, 4)

  return (
    <footer className="border-t bg-muted/30">
      <div className="container px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-bold gradient-text">DevTools Hub</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your ultimate collection of free developer tools. Built by developers, for developers.
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href={SOCIAL_LINKS.github}
                target="_blank"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Popular Tools */}
          <div className="space-y-4">
            <h3 className="font-semibold">Popular Tools</h3>
            <ul className="space-y-2">
              {popularTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    href={tool.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold">Categories</h3>
            <ul className="space-y-2">
              {TOOL_CATEGORIES.map(category => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <Mail className="h-3 w-3" />
                  <span>Contact</span>
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/devtools-hub/issues"
                  target="_blank"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <span>Report Bug</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Recent Tools */}
        {recentTools.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="font-semibold mb-4">Recently Added</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentTools.map(tool => (
                <Link
                  key={tool.id}
                  href={tool.path}
                  className="group flex items-center space-x-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
                >
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">{tool.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium group-hover:text-primary transition-colors">
                      {tool.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{tool.description}</div>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                    New
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {currentYear} DevTools Hub. Made with{' '}
            <Heart className="inline h-4 w-4 text-red-500" /> for developers.
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </div>
            <Link href="/status" className="hover:text-foreground transition-colors">
              Status Page
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
