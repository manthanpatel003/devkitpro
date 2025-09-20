'use client'

import { cn } from '@/lib/utils'
import * as React from 'react'

interface TypeWriterProps {
  text: string | string[]
  speed?: number
  delay?: number
  loop?: boolean
  className?: string
  cursor?: boolean
  onComplete?: () => void
}

export function TypeWriter({
  text,
  speed = 50,
  delay = 0,
  loop = false,
  className,
  cursor = true,
  onComplete,
}: TypeWriterProps) {
  const [displayText, setDisplayText] = React.useState('')
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showCursor, setShowCursor] = React.useState(true)

  const textArray = Array.isArray(text) ? text : [text]
  const currentText = textArray[currentIndex]

  React.useEffect(() => {
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (displayText.length < currentText.length) {
            setDisplayText(currentText.substring(0, displayText.length + 1))
          } else {
            // Finished typing current text
            if (textArray.length > 1 && loop) {
              setTimeout(() => setIsDeleting(true), 1000)
            } else if (onComplete) {
              onComplete()
            }
          }
        } else {
          // Deleting
          if (displayText.length > 0) {
            setDisplayText(currentText.substring(0, displayText.length - 1))
          } else {
            // Finished deleting
            setIsDeleting(false)
            setCurrentIndex(prev => (prev + 1) % textArray.length)
          }
        }
      },
      delay + (isDeleting ? speed / 2 : speed)
    )

    return () => clearTimeout(timeout)
  }, [displayText, currentText, isDeleting, speed, delay, textArray, loop, onComplete])

  React.useEffect(() => {
    if (cursor) {
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev)
      }, 530)

      return () => clearInterval(cursorInterval)
    }
  }, [cursor])

  return (
    <span className={cn('inline-block', className)}>
      {displayText}
      {cursor && (
        <span
          className={cn(
            'inline-block w-0.5 h-[1em] bg-current ml-1 transition-opacity',
            showCursor ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </span>
  )
}

export function TypeWriterLines({
  lines,
  speed = 50,
  lineDelay = 1000,
  className,
}: {
  lines: string[]
  speed?: number
  lineDelay?: number
  className?: string
}) {
  const [currentLine, setCurrentLine] = React.useState(0)
  const [completedLines, setCompletedLines] = React.useState<string[]>([])

  const handleLineComplete = React.useCallback(() => {
    setCompletedLines(prev => [...prev, lines[currentLine]])

    if (currentLine < lines.length - 1) {
      setTimeout(() => {
        setCurrentLine(prev => prev + 1)
      }, lineDelay)
    }
  }, [currentLine, lines, lineDelay])

  return (
    <div className={cn('space-y-2', className)}>
      {completedLines.map((line, index) => (
        <div key={index} className="text-current">
          {line}
        </div>
      ))}
      {currentLine < lines.length && (
        <TypeWriter text={lines[currentLine]} speed={speed} onComplete={handleLineComplete} />
      )}
    </div>
  )
}
