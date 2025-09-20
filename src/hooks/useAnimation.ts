'use client'

import { AnimationConfig } from '@/types'
import { useEffect, useRef, useState } from 'react'

export function useAnimation(config: AnimationConfig) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const startAnimation = () => {
    if (hasAnimated) return
    setIsAnimating(true)
    setHasAnimated(true)

    setTimeout(
      () => {
        setIsAnimating(false)
      },
      config.duration + (config.delay || 0)
    )
  }

  const resetAnimation = () => {
    setIsAnimating(false)
    setHasAnimated(false)
  }

  return {
    elementRef,
    isAnimating,
    hasAnimated,
    startAnimation,
    resetAnimation,
  }
}

export function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = elementRef.current
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [])

  return { elementRef, isVisible }
}

export function useCountUp(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start)
  const [isActive, setIsActive] = useState(false)

  const startCountUp = () => {
    if (isActive) return

    setIsActive(true)
    const increment = (end - start) / (duration / 16) // 60fps
    let current = start

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
        setIsActive(false)
      } else {
        setCount(Math.floor(current))
      }
    }, 16)

    return () => clearInterval(timer)
  }

  return { count, startCountUp, isActive }
}

export function useTypewriter(text: string, speed: number = 50, delay: number = 0) {
  const [displayText, setDisplayText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const startTyping = () => {
    if (isTyping || isComplete) return

    setTimeout(() => {
      setIsTyping(true)
      let i = 0

      const typeInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1))
          i++
        } else {
          setIsTyping(false)
          setIsComplete(true)
          clearInterval(typeInterval)
        }
      }, speed)
    }, delay)
  }

  const resetTyping = () => {
    setDisplayText('')
    setIsTyping(false)
    setIsComplete(false)
  }

  return {
    displayText,
    isTyping,
    isComplete,
    startTyping,
    resetTyping,
  }
}

export function useHoverAnimation() {
  const [isHovered, setIsHovered] = useState(false)

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  }

  return { isHovered, hoverProps }
}

export function useStaggeredAnimation(itemCount: number, delay: number = 100) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(itemCount).fill(false))

  const startStaggeredAnimation = () => {
    visibleItems.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => {
          const newItems = [...prev]
          newItems[index] = true
          return newItems
        })
      }, index * delay)
    })
  }

  const resetAnimation = () => {
    setVisibleItems(new Array(itemCount).fill(false))
  }

  return {
    visibleItems,
    startStaggeredAnimation,
    resetAnimation,
  }
}
