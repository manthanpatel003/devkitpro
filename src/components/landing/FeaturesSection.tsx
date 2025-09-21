'use client'

import { FadeIn, FadeInStagger } from '@/components/animations/FadeIn'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { TOOL_CATEGORIES, TOOLS } from '@/lib/constants'
import { ArrowRight, CheckCircle, Clock, Globe, Heart, Lock, Shield, Star, Zap } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: Shield,
    title: '100% Privacy Focused',
    description:
      'Your data never leaves your browser. All processing happens locally for maximum security and privacy.',
    color: 'text-green-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Instant results with optimized algorithms. No waiting, no loading screens, just immediate productivity.',
    color: 'text-yellow-500',
  },
  {
    icon: Heart,
    title: 'Always Free',
    description:
      'No subscriptions, no hidden fees, no premium tiers. All 20+ tools are completely free forever.',
    color: 'text-red-500',
  },
  {
    icon: Globe,
    title: 'Works Everywhere',
    description:
      'Access from any device, any browser, anywhere. Fully responsive and mobile-optimized.',
    color: 'text-blue-500',
  },
  {
    icon: Lock,
    title: 'No Registration',
    description:
      'Start using tools immediately. No accounts to create, no personal information required.',
    color: 'text-purple-500',
  },
  {
    icon: Clock,
    title: 'Always Available',
    description: '99.9% uptime guarantee. Your tools are ready when you need them, 24/7.',
    color: 'text-orange-500',
  },
]

const benefits = [
  'Save hours of development time daily',
  'Boost productivity with instant tools',
  'Secure processing in your browser',
  'No software installation required',
  'Regular updates and new tools',
  'Mobile-friendly responsive design',
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Why Developers Choose <span className="gradient-text">DevTools Hub</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Built by developers, for developers. Every feature designed to enhance your workflow
              and protect your privacy.
            </p>
          </div>
        </FadeIn>

        {/* Main Features Grid */}
        <FadeInStagger
          staggerDelay={100}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <Card key={index} variant="default" className="hover-lift">
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-4 ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </FadeInStagger>

        {/* Tool Categories */}
        <FadeIn delay={800}>
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Organized by Category</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the right tool quickly with our organized categories. From network diagnostics to
              code formatting, we've got you covered.
            </p>
          </div>
        </FadeIn>

        <FadeInStagger
          staggerDelay={150}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
        >
          {TOOL_CATEGORIES.map((category, index) => {
            const categoryTools = TOOLS.filter(tool => tool.category?.id === category.id)

            return (
              <Card key={category.id} variant="default" className="group">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}
                    >
                      <span className="text-white font-semibold text-sm">
                        {categoryTools.length}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {categoryTools.slice(0, 3).map(tool => (
                      <div
                        key={tool.id}
                        className="flex items-center space-x-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{tool.name}</span>
                      </div>
                    ))}
                    {categoryTools.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{categoryTools.length - 3} more tools
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    View Tools
                    <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </FadeInStagger>

        {/* Benefits Section */}
        <FadeIn delay={1000}>
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-2xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Everything You Need in One Place</h3>
                <p className="text-muted-foreground mb-6">
                  Stop switching between multiple websites and tools. Get everything you need for
                  development, SEO, and productivity in one unified platform.
                </p>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link href="/tools">
                    <Button variant="primary" size="lg">
                      Start Using Tools
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="https://github.com/devtools-hub" target="_blank">
                    <Button variant="outline" size="lg">
                      <Star className="mr-2 h-4 w-4" />
                      Star on GitHub
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {TOOLS.filter(tool => tool.featured)
                    .slice(0, 4)
                    .map((tool, index) => (
                      <Card
                        key={tool.id}
                        variant="default"
                        className={`hover-lift ${index % 2 === 0 ? 'mt-8' : ''}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {tool.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <CardTitle className="text-sm">{tool.name}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-xs text-muted-foreground">
                            {tool.description.slice(0, 60)}...
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full animate-pulse-soft" />
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg rotate-45 animate-float" />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
