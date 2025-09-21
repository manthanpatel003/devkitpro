import { FadeIn } from '@/components/animations/FadeIn'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { ToolsGrid } from '@/components/tools/ToolsGrid'
import { TOOLS, TOOL_CATEGORIES } from '@/lib/constants'
import { generateToolSEO } from '@/lib/seo-config'

export const metadata = generateToolSEO(
  'All Developer Tools',
  'Browse our complete collection of 20+ free developer tools and utilities. JSON formatter, IP checker, QR generator, and more.',
  ['developer tools', 'free tools', 'utilities', 'online tools', 'web development']
)

export default function ToolsPage() {
  const featuredTools = TOOLS.filter(tool => tool.featured)
  const popularTools = TOOLS.filter(tool => tool.popular)

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="border-b bg-muted/30">
          <div className="container px-4 py-12">
            <FadeIn>
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">All Developer Tools</h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  Discover our complete collection of free developer tools and utilities. Everything
                  you need to boost your productivity in one place.
                </p>
                <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
                  <div>
                    <span className="font-semibold text-primary">{TOOLS.length}</span> Tools
                  </div>
                  <div>
                    <span className="font-semibold text-primary">{TOOL_CATEGORIES.length}</span>{' '}
                    Categories
                  </div>
                  <div>
                    <span className="font-semibold text-primary">100%</span> Free
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        <div className="container px-4 py-12">
          {/* Featured Tools */}
          {featuredTools.length > 0 && (
            <FadeIn delay={200}>
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Featured Tools</h2>
                <ToolsGrid tools={featuredTools} />
              </div>
            </FadeIn>
          )}

          {/* Popular Tools */}
          {popularTools.length > 0 && (
            <FadeIn delay={400}>
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Popular Tools</h2>
                <ToolsGrid tools={popularTools} />
              </div>
            </FadeIn>
          )}

          {/* All Tools by Category */}
          <FadeIn delay={600}>
            <div className="space-y-12">
              {TOOL_CATEGORIES.map(category => {
                const categoryTools = TOOLS.filter(tool => tool.category?.id === category.id)

                if (categoryTools.length === 0) return null

                return (
                  <div key={category.id}>
                    <div className="flex items-center space-x-3 mb-6">
                      <div
                        className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}
                      >
                        <span className="text-white font-semibold text-sm">
                          {categoryTools.length}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{category.name}</h2>
                        <p className="text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <ToolsGrid tools={categoryTools} />
                  </div>
                )
              })}
            </div>
          </FadeIn>
        </div>
      </main>
      <Footer />
    </>
  )
}
