import React from 'react'

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function CustomButton({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: CustomButtonProps) {
  const baseStyle = 'font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variantStyles = {
    default: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
  }
  const sizeStyles = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}