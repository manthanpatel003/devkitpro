import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: string
  helper?: string
  fullWidth?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  rows?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    label,
    error,
    success,
    helper,
    fullWidth = false,
    resize = 'vertical',
    rows = 4,
    ...props
  }, ref) => {
    const textareaClasses = cn(
      'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
      {
        'border-red-300 focus:ring-red-500 focus:border-red-500': error,
        'border-green-300 focus:ring-green-500 focus:border-green-500': success && !error,
        'border-gray-300 focus:ring-primary-500 focus:border-primary-500': !error && !success,
        'w-full': fullWidth,
        'resize-none': resize === 'none',
        'resize-y': resize === 'vertical',
        'resize-x': resize === 'horizontal',
        'resize': resize === 'both'
      },
      className
    )
    
    return (
      <div className={cn('space-y-1', { 'w-full': fullWidth })}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <textarea
            className={textareaClasses}
            ref={ref}
            rows={rows}
            {...props}
          />
          {error && (
            <div className="absolute top-2 right-2 flex items-center pointer-events-none">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
          {success && !error && (
            <div className="absolute top-2 right-2 flex items-center pointer-events-none">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </p>
        )}
        {success && !error && (
          <p className="text-sm text-green-600 flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            {success}
          </p>
        )}
        {helper && !error && !success && (
          <p className="text-sm text-gray-500">{helper}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }