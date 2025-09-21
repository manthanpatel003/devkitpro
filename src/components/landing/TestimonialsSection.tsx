'use client'

import { FadeIn } from '@/components/animations/FadeIn'
import { Card, CardContent } from '@/components/ui/Card'
import { Quote, Star } from 'lucide-react'
import * as React from 'react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Full Stack Developer',
    company: 'TechCorp',
    content:
      'DevTools Hub has become my go-to resource for quick formatting and validation tasks. The JSON formatter alone saves me hours every week!',
    rating: 5,
    avatar: 'SC',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'DevOps Engineer',
    company: 'CloudScale',
    content:
      'Love the privacy-first approach. All tools work locally in the browser - perfect for handling sensitive data without security concerns.',
    rating: 5,
    avatar: 'MR',
  },
  {
    name: 'Emily Johnson',
    role: 'Frontend Developer',
    company: 'StartupXYZ',
    content:
      'The UI is beautiful and the tools are lightning fast. No more bookmarking dozens of different utility websites - everything is here!',
    rating: 5,
    avatar: 'EJ',
  },
  {
    name: 'David Kim',
    role: 'Backend Developer',
    company: 'Enterprise Inc',
    content:
      'Impressed by the quality and completeness of each tool. The hash generator and Base64 encoder work flawlessly every time.',
    rating: 5,
    avatar: 'DK',
  },
  {
    name: 'Lisa Thompson',
    role: 'SEO Specialist',
    company: 'Marketing Pro',
    content:
      'The SEO tools are fantastic! Meta tag analyzer and keyword density checker help me optimize content efficiently.',
    rating: 5,
    avatar: 'LT',
  },
  {
    name: 'Alex Petrov',
    role: 'Security Engineer',
    company: 'SecureNet',
    content:
      'Finally, developer tools that respect privacy. Client-side processing means our sensitive data never leaves our control.',
    rating: 5,
    avatar: 'AP',
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.ceil(testimonials.length / 3))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              What Developers Are Saying
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Join thousands of satisfied developers who have streamlined their workflow with our
              tools.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={index} delay={index * 100}>
              <Card variant="glass" className="hover-lift h-full">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <div className="relative mb-6">
                    <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                    <p className="text-muted-foreground italic pl-6">"{testimonial.content}"</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* Trust Indicators */}
        <FadeIn delay={600}>
          <div className="mt-16 text-center">
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-1">
                  {['SC', 'MR', 'EJ', 'DK', 'LT'].map((avatar, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs border-2 border-background"
                    >
                      {avatar}
                    </div>
                  ))}
                </div>
                <span>50,000+ happy developers</span>
              </div>

              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 average rating</span>
              </div>

              <div>
                <span>Trusted by teams at 1000+ companies</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
