import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  text?: string
}

const LoadingSpinner = ({ className, size = 'md' }: { className?: string; size?: string }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-muted border-t-primary',
        sizeClasses[size as keyof typeof sizeClasses],
        className
      )}
    />
  )
}

const LoadingDots = ({ className, size = 'md' }: { className?: string; size?: string }) => {
  const sizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
  }

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={cn(
            'animate-bounce rounded-full bg-primary',
            sizeClasses[size as keyof typeof sizeClasses]
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

const LoadingPulse = ({ className, size = 'md' }: { className?: string; size?: string }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div
      className={cn(
        'animate-pulse rounded-full bg-primary/20',
        sizeClasses[size as keyof typeof sizeClasses],
        className
      )}
    />
  )
}

const LoadingSkeleton = ({ className, lines = 3 }: { className?: string; lines?: number }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn('h-4 bg-muted animate-pulse rounded', i === lines - 1 && 'w-3/4')}
        />
      ))}
    </div>
  )
}

export function Loading({ className, size = 'md', variant = 'spinner', text }: LoadingProps) {
  const renderLoading = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots size={size} />
      case 'pulse':
        return <LoadingPulse size={size} />
      case 'skeleton':
        return <LoadingSkeleton />
      default:
        return <LoadingSpinner size={size} />
    }
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      {renderLoading()}
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <h2 className="text-xl font-semibold">Loading...</h2>
        <p className="text-muted-foreground">Please wait while we prepare your tools</p>
      </div>
    </div>
  )
}

export function ToolLoading({ toolName }: { toolName?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <LoadingSpinner size="md" />
        <p className="text-sm text-muted-foreground">
          {toolName ? `Loading ${toolName}...` : 'Processing...'}
        </p>
      </div>
    </div>
  )
}

export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size="sm" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  )
}
