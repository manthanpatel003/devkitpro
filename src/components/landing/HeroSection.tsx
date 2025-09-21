'use client'

import { CountUp } from '@/components/animations/CountUp'
import { FadeIn } from '@/components/animations/FadeIn'
import { TypeWriter } from '@/components/animations/TypeWriter'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TOOLS } from '@/lib/constants'
import { ArrowRight, Clock, Github, Search, Shield, Sparkles, Star, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

const heroTexts = [
  'Build Better. Code Faster. Deploy Smarter.',
  'Your Ultimate Developer Toolkit',
  '20+ Free Tools. Zero Compromises.',
]

const FloatingParticle = ({ delay }: { delay: number }) => (
  <div
    className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${3 + Math.random() * 2}s`,
    }}
  />
)

export function HeroSection() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    setIsVisible(true)
  }, [])

  const filteredTools = React.useMemo(() => {
    if (!searchQuery) return []
    return TOOLS.filter(
      tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 3)
  }, [searchQuery])

  const popularTools = TOOLS.filter(tool => tool.popular).slice(0, 6)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 animate-gradient bg-[length:400%_400%]" />

        {/* Floating Particles */}
        <div className="particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <FloatingParticle key={i} delay={i * 0.2} />
          ))}
        </div>

        {/* Geometric Shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 border border-primary/20 rounded-full animate-spin-slow" />
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg rotate-45 animate-float" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-primary/30 rotate-45 animate-pulse-soft" />
      </div>

      <div className="container mx-auto relative z-10 px-4 py-20">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          {/* Badge */}
          <FadeIn delay={200}>
            <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium bg-background/50 backdrop-blur-sm hover-lift">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span className="text-primary font-semibold">20+ Free Tools</span>
              <span className="mx-2 text-muted-foreground">•</span>
              <span className="text-muted-foreground">No Signup Required</span>
            </div>
          </FadeIn>

          {/* Main Headline */}
          <FadeIn delay={400}>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block">Your Ultimate</span>
                <span className="block gradient-text">
                  <TypeWriter text={heroTexts} speed={100} delay={1000} loop={true} />
                </span>
              </h1>
            </div>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={600}>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Boost your productivity with our collection of{' '}
              <span className="font-semibold text-foreground">20+ essential developer tools</span>.
              Format JSON, check IPs, generate QR codes, and much more – all free and
              privacy-focused.
            </p>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={800}>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  <CountUp end={20} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground">Free Tools</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  <CountUp end={100} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground">Privacy First</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  <CountUp end={99.9} decimals={1} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  <CountUp end={0} />
                </div>
                <div className="text-sm text-muted-foreground">Signup Required</div>
              </div>
            </div>
          </FadeIn>

          {/* Search */}
          <FadeIn delay={1000}>
            <div className="mx-auto max-w-md space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tools... (e.g., JSON formatter)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base bg-background/80 backdrop-blur-sm border-primary/20 focus:border-primary hover:border-primary/40 transition-all"
                />
              </div>

              {filteredTools.length > 0 && (
                <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-2 space-y-1 animate-fade-in">
                  {filteredTools.map(tool => (
                    <Link
                      key={tool.id}
                      href={tool.path}
                      className="flex items-center space-x-3 rounded-md p-3 text-sm hover:bg-accent hover:text-accent-foreground transition-colors hover-lift"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        <span className="text-xs font-medium text-primary">
                          {tool.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-xs text-muted-foreground">{tool.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          {/* CTA Buttons */}
          <FadeIn delay={1200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="gradient"
                className="text-lg px-8 py-6 h-auto font-semibold animate-pulse-soft"
              >
                <Link href="/tools">
                  <Zap className="mr-2 h-5 w-5" />
                  Explore Tools
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 h-auto font-semibold"
              >
                <Link href="https://github.com/devtools-hub" target="_blank">
                  <Github className="mr-2 h-5 w-5" />
                  Star on GitHub
                  <Star className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </FadeIn>

          {/* Trust Indicators */}
          <FadeIn delay={1400}>
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8 opacity-70">
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-4 w-4 text-green-500" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Always Free</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-purple-500" />
                <span>Privacy First</span>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Popular Tools Preview */}
        <FadeIn delay={1600}>
          <div className="mx-auto max-w-6xl mt-20">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-4">Popular Developer Tools</h2>
              <p className="text-muted-foreground">
                Get started with these most-used tools by developers worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularTools.map((tool, index) => (
                <FadeIn key={tool.id} delay={1800 + index * 100}>
                  <Link
                    href={tool.path}
                    className="group block p-6 rounded-xl border bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300 hover-lift hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <span className="text-sm font-medium text-primary">
                          {tool.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${tool.category.color}`}
                          />
                          <span>{tool.category.name}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
                      {tool.description}
                    </p>
                    <div className="mt-3 flex items-center text-xs text-primary font-medium">
                      Try now
                      <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
