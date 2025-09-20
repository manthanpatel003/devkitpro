'use client'

import { FadeIn } from '@/components/animations/FadeIn'
import { TypeWriter } from '@/components/animations/TypeWriter'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Code, Github, Heart, Rocket, Sparkles, Star, Zap } from 'lucide-react'
import Link from 'next/link'

const ctaTexts = [
  'Ready to boost your productivity?',
  'Start building better, faster today!',
  'Join 50,000+ developers using our tools!',
]

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/10 animate-gradient bg-[length:400%_400%]" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 border border-primary/20 rounded-full animate-spin-slow" />
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg rotate-45 animate-float" />
      <div className="absolute top-1/2 left-1/4 w-12 h-12 border-2 border-primary/30 rotate-45 animate-pulse-soft" />

      <div className="container relative z-10 px-4">
        <FadeIn>
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium bg-background/50 backdrop-blur-sm">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              <span className="text-primary font-semibold">100% Free Forever</span>
              <span className="mx-2 text-muted-foreground">•</span>
              <span className="text-muted-foreground">No Strings Attached</span>
            </div>

            {/* Main CTA */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                <TypeWriter text={ctaTexts} speed={80} delay={500} loop={true} />
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Don't waste another minute switching between different tools. Get everything you
                need in one place and{' '}
                <span className="font-semibold text-foreground">
                  start being more productive today
                </span>
                .
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="xl"
                variant="gradient"
                className="text-lg px-10 py-6 h-auto font-semibold animate-glow"
                asChild
              >
                <Link href="/tools">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Using Tools Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                size="xl"
                variant="outline"
                className="text-lg px-10 py-6 h-auto font-semibold hover:bg-background"
                asChild
              >
                <Link href="https://github.com/devtools-hub" target="_blank">
                  <Github className="mr-2 h-5 w-5" />
                  View Source Code
                  <Star className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Features Highlight */}
            <div className="flex flex-wrap justify-center items-center gap-6 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4 text-green-500" />
                <span>20+ Developer Tools</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Privacy Focused</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-purple-500" />
                <span>Always Free</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">Trusted by developers at</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="text-sm font-semibold">Google</div>
                <div className="text-sm font-semibold">Microsoft</div>
                <div className="text-sm font-semibold">Meta</div>
                <div className="text-sm font-semibold">Netflix</div>
                <div className="text-sm font-semibold">Spotify</div>
                <div className="text-sm font-semibold">Airbnb</div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
