import { FadeIn } from '@/components/animations/FadeIn'
import { Button } from '@/components/ui/Button'
import { Home, Search } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-8 px-4">
        <FadeIn>
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-muted-foreground/50">404</h1>
            <h2 className="text-2xl font-bold">Page Not Found</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Sorry, we couldn't find the page you're looking for. The tool you're looking for might
              have been moved or doesn't exist.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button leftIcon={<Home className="h-4 w-4" />}>Go Home</Button>
            </Link>

            <Link href="/tools">
              <Button variant="outline" leftIcon={<Search className="h-4 w-4" />}>
                Browse Tools
              </Button>
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <div className="text-sm text-muted-foreground">
            <p>Looking for a specific tool? Try our search or browse all tools.</p>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
