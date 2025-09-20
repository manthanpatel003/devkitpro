'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Loader2, Zap, FileText, Image, Code, Globe, Settings } from 'lucide-react'

interface LoadingStateProps {
  title?: string
  description?: string
  type?: 'default' | 'tool' | 'api' | 'processing' | 'uploading' | 'analyzing'
  showProgress?: boolean
  progress?: number
  message?: string
}

const loadingConfig = {
  default: {
    icon: Loader2,
    title: 'Loading...',
    description: 'Please wait while we load the content.'
  },
  tool: {
    icon: Settings,
    title: 'Loading Tool...',
    description: 'Setting up the tool for you.'
  },
  api: {
    icon: Globe,
    title: 'Fetching Data...',
    description: 'Retrieving information from the server.'
  },
  processing: {
    icon: Zap,
    title: 'Processing...',
    description: 'Working on your request.'
  },
  uploading: {
    icon: FileText,
    title: 'Uploading...',
    description: 'Please wait while we process your file.'
  },
  analyzing: {
    icon: Code,
    title: 'Analyzing...',
    description: 'Examining the data for insights.'
  }
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title,
  description,
  type = 'default',
  showProgress = false,
  progress = 0,
  message
}) => {
  const config = loadingConfig[type]
  const Icon = config.icon

  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            {title || config.title}
          </CardTitle>
          <CardDescription className="text-base">
            {description || config.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </div>
          )}
          
          {message && (
            <div className="text-center text-sm text-gray-600">
              {message}
            </div>
          )}
          
          <div className="flex justify-center">
            <LoadingSpinner size="sm" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Skeleton loading components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Card className={`animate-pulse ${className}`}>
    <CardHeader>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>
    </CardContent>
  </Card>
)

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className = '' 
}) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-3 bg-gray-200 rounded ${
          i === lines - 1 ? 'w-4/6' : 'w-full'
        }`}
      />
    ))}
  </div>
)

export const SkeletonButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse h-10 bg-gray-200 rounded ${className}`}></div>
)

export const SkeletonInput: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse h-10 bg-gray-200 rounded ${className}`}></div>
)

// Loading overlay
export const LoadingOverlay: React.FC<{
  isVisible: boolean
  message?: string
  type?: LoadingStateProps['type']
}> = ({ isVisible, message, type = 'default' }) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <div className="mt-4 text-lg font-medium text-gray-900">
            {loadingConfig[type].title}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {message || loadingConfig[type].description}
          </div>
        </div>
      </div>
    </div>
  )
}

// Inline loading indicator
export const InlineLoading: React.FC<{ message?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  message = 'Loading...', 
  size = 'md' 
}) => (
  <div className="flex items-center justify-center p-4">
    <div className="flex items-center space-x-2">
      <LoadingSpinner size={size} />
      <span className="text-gray-600">{message}</span>
    </div>
  </div>
)