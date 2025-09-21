'use client'

import { FadeIn } from '@/components/animations/FadeIn'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tool } from '@/types'
import { ArrowRight, Clock, Star, Zap } from 'lucide-react'
import Link from 'next/link'

interface ToolsGridProps {
  tools: Tool[]
  showCategory?: boolean
}

export function ToolsGrid({ tools, showCategory = false }: ToolsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool, index) => (
        <FadeIn key={tool.id} delay={index * 50}>
          <Card variant="default" className="h-full group">
            <CardHeader>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${
                      tool.category?.color || 'bg-blue-500'
                    } flex items-center justify-center`}
                  >
                    <span className="text-white font-semibold text-sm">{tool.name.charAt(0)}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {tool.name}
                    </CardTitle>
                    {showCategory && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            tool.category?.color || 'bg-blue-500'
                          }`}
                        />
                        <span>{tool.category?.name || 'Tool'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {tool.featured && (
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Star className="h-3 w-3 text-blue-500" />
                    </div>
                  )}
                  {tool.popular && (
                    <div className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-yellow-500" />
                    </div>
                  )}
                  {tool.new && (
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Clock className="h-3 w-3 text-green-500" />
                    </div>
                  )}
                </div>
              </div>

              <CardDescription className="text-sm">{tool.description}</CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {tool.keywords.slice(0, 3).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>

                <Link href={tool.path}>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Use Tool
                    <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      ))}
    </div>
  )
}
