'use client'

import { useEffect, useState } from 'react'
import { useAuthenticationStatus, useSignOut, useUserData } from '@nhost/nextjs'
import { useRouter } from 'next/navigation'
import { nhost } from '../../lib/nhost'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.displayName || user?.email || 'User'}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                You&apos;re successfully authenticated with Nhost
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">User Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Email</h3>
              <p className="text-gray-900 dark:text-white">{user?.email}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</h3>
              <p className="text-gray-900 dark:text-white">{user?.displayName || 'Not set'}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">User ID</h3>
              <p className="text-gray-900 dark:text-white font-mono text-sm">{user?.id}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Email Verified</h3>
              <p className="text-gray-900 dark:text-white">
                {user?.emailVerified ? (
                  <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400">⚠ Not verified</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Movies Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Sample Movies Data</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This data is fetched from your Nhost GraphQL API. Make sure to set up the movies table as described in the documentation.
          </p>
          
          {moviesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading movies...</span>
            </div>
          ) : moviesError ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-400">
                {moviesError}
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-2">
                Check your .env file and make sure your Nhost project is configured correctly.
              </p>
            </div>
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
        </div>
      </div>
    </div>
  )
}