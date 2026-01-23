'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'

export default function TeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams()
  const teamId = params?.teamId as string

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Team page error:', error)
    }
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            {error.message || 'Failed to load this page. Please try again.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error.digest && (
            <p className="text-xs text-center text-muted-foreground mb-4 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Teams
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
