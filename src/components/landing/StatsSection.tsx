'use client'

import { CountUp } from '@/components/animations/CountUp'
import { FadeIn } from '@/components/animations/FadeIn'
import { Card, CardContent } from '@/components/ui/Card'
import { Clock, Download, Globe, Shield, Star, Users, Wrench, Zap } from 'lucide-react'

const stats = [
  {
    icon: Wrench,
    label: 'Developer Tools',
    value: 20,
    suffix: '+',
    description: 'Essential tools for every developer',
    color: 'text-blue-500',
  },
  {
    icon: Users,
    label: 'Happy Users',
    value: 50000,
    suffix: '+',
    description: 'Developers trust our platform',
    color: 'text-green-500',
  },
  {
    icon: Download,
    label: 'Monthly Usage',
    value: 1200000,
    suffix: '+',
    description: 'Tool executions per month',
    color: 'text-purple-500',
  },
  {
    icon: Clock,
    label: 'Uptime',
    value: 99.9,
    suffix: '%',
    decimals: 1,
    description: 'Always available when you need it',
    color: 'text-orange-500',
  },
  {
    icon: Shield,
    label: 'Privacy Score',
    value: 100,
    suffix: '%',
    description: 'Your data stays with you',
    color: 'text-red-500',
  },
  {
    icon: Star,
    label: 'GitHub Stars',
    value: 2500,
    suffix: '+',
    description: 'Open source community support',
    color: 'text-yellow-500',
  },
  {
    icon: Globe,
    label: 'Countries Served',
    value: 180,
    suffix: '+',
    description: 'Global developer community',
    color: 'text-indigo-500',
  },
  {
    icon: Zap,
    label: 'Average Response',
    value: 50,
    suffix: 'ms',
    description: 'Lightning-fast performance',
    color: 'text-cyan-500',
  },
]

export function StatsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Trusted by Developers <span className="gradient-text">Worldwide</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Join thousands of developers who rely on our tools daily to boost their productivity
              and streamline their workflow.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <FadeIn key={index} delay={index * 100}>
              <Card variant="glass" className="text-center hover-lift">
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-background/50 ${stat.color} mb-4`}
                  >
                    <stat.icon className="h-6 w-6" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-3xl font-bold">
                      <CountUp
                        end={stat.value}
                        suffix={stat.suffix}
                        decimals={stat.decimals || 0}
                        duration={2000}
                        delay={index * 100}
                      />
                    </div>

                    <div className="text-sm font-medium text-foreground">{stat.label}</div>

                    <div className="text-xs text-muted-foreground">{stat.description}</div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Achievement Badges */}
        <FadeIn delay={800}>
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold mb-8">Recognized Excellence</h3>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-500" />
                </div>
                <span>Privacy Certified</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-blue-500" />
                </div>
                <span>Performance Optimized</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Star className="h-4 w-4 text-purple-500" />
                </div>
                <span>Developer Approved</span>
              </div>

              <div className="flex items-center space-x-2 text-sm">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-orange-500" />
                </div>
                <span>Globally Available</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
