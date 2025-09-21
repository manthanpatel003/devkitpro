'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ADVANCED_TOOLS, TOOL_CATEGORIES } from '@/lib/tools-config'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as React from 'react'

interface ToolListProps {
  className?: string
  showSearch?: boolean
  showCategories?: boolean
  maxTools?: number
  featuredOnly?: boolean
  popularOnly?: boolean
}

/**
 * ToolList Component - Displays tools in an organized, accessible way
 *
 * Features:
 * - Search functionality with debounced input
 * - Category filtering
 * - Featured and popular tool filtering
 * - Keyboard navigation support
 * - Accessible markup with proper ARIA labels
 * - Responsive grid layout
 *
 * Usage:
 * <ToolList
 *   showSearch={true}
 *   showCategories={true}
 *   featuredOnly={false}
 *   maxTools={12}
 * />
 */
export function ToolList({
  className,
  showSearch = true,
  showCategories = true,
  maxTools,
  featuredOnly = false,
  popularOnly = false,
}: ToolListProps) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)

  // Filter tools based on props
  const filteredTools = React.useMemo(() => {
    let tools = ADVANCED_TOOLS

    // Apply featured/popular filters
    if (featuredOnly) {
      tools = tools.filter(tool => tool.featured)
    } else if (popularOnly) {
      tools = tools.filter(tool => tool.popular)
    }

    // Apply category filter
    if (selectedCategory) {
      tools = tools.filter(tool => tool.category.id === selectedCategory)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      tools = tools.filter(
        tool =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.keywords.some(keyword => keyword.toLowerCase().includes(query))
      )
    }

    // Apply max tools limit
    if (maxTools) {
      tools = tools.slice(0, maxTools)
    }

    return tools
  }, [searchQuery, selectedCategory, featuredOnly, popularOnly, maxTools])

  // Group tools by category for display
  const toolsByCategory = React.useMemo(() => {
    if (!showCategories) {
      return { 'All Tools': filteredTools }
    }

    const grouped: Record<string, typeof filteredTools> = {}

    filteredTools.forEach(tool => {
      const categoryName = tool.category.name
      if (!grouped[categoryName]) {
        grouped[categoryName] = []
      }
      grouped[categoryName].push(tool)
    })

    return grouped
  }, [filteredTools, showCategories])

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('')
      setIsSearchFocused(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsSearchFocused(false)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search and Filters */}
      {showSearch && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>

          {/* Category Filter */}
          {showCategories && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-xs"
              >
                All Categories
              </Button>
              {TOOL_CATEGORIES.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-xs"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tools Grid */}
      <div className="space-y-8">
        {Object.entries(toolsByCategory).map(([categoryName, tools]) => (
          <div key={categoryName} className="space-y-4">
            {showCategories && Object.keys(toolsByCategory).length > 1 && (
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                {categoryName}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({tools.length} tool{tools.length !== 1 ? 's' : ''})
                </span>
              </h3>
            )}

            {tools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map(tool => {
                  const IconComponent =
                    require('lucide-react')[tool.icon] || require('lucide-react')['Settings']
                  const isActive = pathname === tool.path

                  return (
                    <Link
                      key={tool.id}
                      href={tool.path}
                      className={cn(
                        'group relative block rounded-lg border bg-card p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                        isActive && 'ring-2 ring-primary ring-offset-2',
                        'hover:bg-accent/50'
                      )}
                      aria-label={`${tool.name} - ${tool.description}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors',
                            tool.category.color,
                            'group-hover:scale-110'
                          )}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-card-foreground group-hover:text-accent-foreground">
                              {tool.name}
                            </h4>
                            {tool.featured && (
                              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                Featured
                              </span>
                            )}
                            {tool.popular && !tool.featured && (
                              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-800 dark:text-green-400">
                                Popular
                              </span>
                            )}
                            {tool.new && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/20 px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-400">
                                New
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {tool.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {tool.keywords.slice(0, 3).map((keyword, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                              >
                                {keyword}
                              </span>
                            ))}
                            {tool.keywords.length > 3 && (
                              <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                                +{tool.keywords.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  {searchQuery ? (
                    <>
                      <p className="text-lg font-medium">No tools found</p>
                      <p className="text-sm">Try adjusting your search terms or category filter</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium">No tools available</p>
                      <p className="text-sm">Check back later for new tools</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Results Summary */}
      {searchQuery && (
        <div className="text-center text-sm text-muted-foreground">
          Found {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} for "
          {searchQuery}"
        </div>
      )}
    </div>
  )
}
