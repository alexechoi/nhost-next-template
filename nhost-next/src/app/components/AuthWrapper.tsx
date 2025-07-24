'use client'

import { useAuthenticationStatus } from '@nhost/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface AuthWrapperProps {
  children: React.ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      // Redirect to auth if not authenticated and not on auth or landing page
      if (!isAuthenticated && pathname !== '/auth' && pathname !== '/') {
        router.push('/auth')
      }
      // Redirect to dashboard if authenticated and on auth page
      if (isAuthenticated && pathname === '/auth') {
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <>{children}</>
}
