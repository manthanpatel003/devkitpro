'use client'

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { cn } from '@/lib/utils'
import * as React from 'react'

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  once?: boolean
  threshold?: number
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 500,
  direction = 'up',
  once = true,
  threshold = 0.1,
}: FadeInProps) {
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold,
    freezeOnceVisible: once,
  })

  const directionClasses = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
    none: '',
  }

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all ease-out',
        !isVisible && 'opacity-0',
        !isVisible && directionClasses[direction],
        isVisible && 'opacity-100 translate-x-0 translate-y-0',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export function FadeInStagger({
  children,
  className,
  staggerDelay = 100,
  ...props
}: FadeInProps & { staggerDelay?: number }) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeIn key={index} delay={index * staggerDelay} {...props}>
          {child}
        </FadeIn>
      ))}
    </div>
  )
}
