// components/ui/Card.tsx
'use client'

import { cn } from '@/lib/utils'

export const Card = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('p-5', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardTitle = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3
      className={cn('text-lg font-semibold text-gray-900 dark:text-white', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export const CardDescription = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={cn('text-sm text-gray-600 dark:text-gray-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export const CardContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('p-5 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn('p-5 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
}