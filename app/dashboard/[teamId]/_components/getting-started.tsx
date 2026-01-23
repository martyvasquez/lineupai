'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, HelpCircle } from 'lucide-react'

const STORAGE_KEY = 'lineupai-hide-getting-started'

export function GettingStarted() {
  const [hidden, setHidden] = useState(true) // Start hidden to avoid flash
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    setHidden(stored === 'true')
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setHidden(true)
  }

  const handleShow = () => {
    localStorage.removeItem(STORAGE_KEY)
    setHidden(false)
  }

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null
  }

  if (hidden) {
    return (
      <button
        onClick={handleShow}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
        Show getting started guide
      </button>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Set up your team to start generating lineups
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground -mt-1 -mr-2"
          >
            <X className="h-4 w-4 mr-1" />
            Don&apos;t show again
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
            1
          </div>
          <div>
            <h3 className="font-medium">Add players to your roster</h3>
            <p className="text-sm text-muted-foreground">
              Go to Roster to add your players with jersey numbers.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
            2
          </div>
          <div>
            <h3 className="font-medium">Set player ratings and eligibility</h3>
            <p className="text-sm text-muted-foreground">
              Rate each player&apos;s abilities and mark position eligibility for key positions.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
            3
          </div>
          <div>
            <h3 className="font-medium">Define team rules</h3>
            <p className="text-sm text-muted-foreground">
              Add your league and team rules in plain language for AI to follow.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
            4
          </div>
          <div>
            <h3 className="font-medium">Create a game and generate lineup</h3>
            <p className="text-sm text-muted-foreground">
              Create an upcoming game, mark players as available, and let AI generate your lineup!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
