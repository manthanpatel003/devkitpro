import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  helper?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    label,
    error,
    success,
    helper,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    ...props
  }, ref) => {
    const inputClasses = cn(
      'block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors',
      {
        'border-red-300 focus:ring-red-500 focus:border-red-500': error,
        'border-green-300 focus:ring-green-500 focus:border-green-500': success && !error,
        'border-gray-300 focus:ring-primary-500 focus:border-primary-500': !error && !success,
        'pl-10': icon && iconPosition === 'left',
        'pr-10': icon && iconPosition === 'right',
        'w-full': fullWidth
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
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{icon}</span>
            </div>
          )}
          <input
            type={type}
            className={inputClasses}
            ref={ref}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{icon}</span>
            </div>
          )}
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
          {success && !error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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

Input.displayName = 'Input'

export { Input }