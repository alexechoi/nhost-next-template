'use client'

import { useEffect, useState } from 'react'
import { useAuthenticationStatus, useSignOut, useUserData } from '@nhost/nextjs'
import { useRouter } from 'next/navigation'
import { nhost } from '../../lib/nhost'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Movie {
  id: string
  title: string
  director: string
  release_year: number
  genre: string
  rating: number
}

const getMovies = `
  query {
    movies {
      id
      title
      director
      release_year
      genre
      rating
    }
  }
`

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  const { signOut } = useSignOut()
  const user = useUserData()
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [moviesLoading, setMoviesLoading] = useState(true)
  const [moviesError, setMoviesError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch movies when component mounts
  useEffect(() => {
    async function fetchMovies() {
      try {
        setMoviesLoading(true)
        const { data, error } = await nhost.graphql.request(getMovies)
        
        if (error) {
          setMoviesError('Failed to fetch movies. Make sure your database is set up correctly.')
        } else {
          setMovies(data?.movies || [])
        }
      } catch {
        setMoviesError('Failed to connect to the database.')
      } finally {
        setMoviesLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchMovies()
    }
  }, [isAuthenticated])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.displayName || user?.email || 'User'}!
                </h1>
                <p className="text-muted-foreground">
                  You&apos;re successfully authenticated with Nhost
                </p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="ghost">
                  <Link href="/">
                    Home
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-muted-foreground mb-1">Email</h3>
                  <p>{user?.email}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-muted-foreground mb-1">Display Name</h3>
                  <p>{user?.displayName || 'Not set'}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-muted-foreground mb-1">User ID</h3>
                  <p className="font-mono text-sm">{user?.id}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-muted-foreground mb-1">Email Verified</h3>
                  <p>
                    {user?.emailVerified ? (
                      <Badge variant="default">✓ Verified</Badge>
                    ) : (
                      <Badge variant="secondary">⚠ Not verified</Badge>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Movies Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sample Movies Data</CardTitle>
            <CardDescription>
              This data is fetched from your Nhost GraphQL API. Make sure to set up the movies table as described in the documentation.
            </CardDescription>
          </CardHeader>
          <CardContent>
          
          {moviesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading movies...</span>
            </div>
          ) : moviesError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {moviesError}
              </AlertDescription>
              <p className="text-sm mt-2">
                Check your .env file and make sure your Nhost project is configured correctly.
              </p>
            </Alert>
          ) : movies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Director</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Year</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Genre</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{movie.title}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{movie.director}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{movie.release_year}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{movie.genre}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{movie.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No movies found. Make sure to set up the sample data in your database.
              </p>
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}