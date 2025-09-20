'use client'

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { cn } from '@/lib/utils'
import * as React from 'react'

interface CountUpProps {
  end: number
  start?: number
  duration?: number
  delay?: number
  className?: string
  prefix?: string
  suffix?: string
  decimals?: number
  separator?: string
}

export function CountUp({
  end,
  start = 0,
  duration = 2000,
  delay = 0,
  className,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ',',
}: CountUpProps) {
  const [count, setCount] = React.useState(start)
  const [hasStarted, setHasStarted] = React.useState(false)
  const { elementRef, isVisible } = useIntersectionObserver({
    threshold: 0.3,
    freezeOnceVisible: true,
  })

  React.useEffect(() => {
    if (isVisible && !hasStarted) {
      setHasStarted(true)

      setTimeout(() => {
        const increment = (end - start) / (duration / 16) // 60fps
        let current = start

        const timer = setInterval(() => {
          current += increment
          if (current >= end) {
            setCount(end)
            clearInterval(timer)
          } else {
            setCount(current)
          }
        }, 16)

        return () => clearInterval(timer)
      }, delay)
    }
  }, [isVisible, hasStarted, end, start, duration, delay])

  const formatNumber = (num: number) => {
    const rounded = Number(num.toFixed(decimals))
    return rounded.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  return (
    <span ref={elementRef} className={cn('tabular-nums', className)}>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  )
}

export function AnimatedNumber({
  value,
  className,
  ...props
}: Omit<CountUpProps, 'end'> & { value: number }) {
  return <CountUp end={value} className={cn('font-bold text-primary', className)} {...props} />
}
