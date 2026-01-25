'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface GenerationLoadingProps {
  phase: 'batting' | 'defensive'
  onCancel?: () => void
  startTime: number
}

const BATTING_MESSAGES = [
  'Analyzing player statistics...',
  'Evaluating batting combinations...',
  'Optimizing lineup order...',
  'Finalizing batting recommendations...',
]

const DEFENSIVE_MESSAGES = [
  'Reviewing position strengths...',
  'Evaluating defensive combinations...',
  'Applying team rules...',
  'Finalizing field positions...',
]

export function GenerationLoading({ phase, onCancel, startTime }: GenerationLoadingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [messageIndex, setMessageIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  const messages = phase === 'batting' ? BATTING_MESSAGES : DEFENSIVE_MESSAGES

  // Scroll into view when component mounts
  useEffect(() => {
    containerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }, [])

  // Rotate messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [messages.length])

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return (
    <Card ref={containerRef} className="border-primary/20 bg-primary/5">
      <CardContent className="py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="space-y-2">
            <p className="font-medium text-lg">{messages[messageIndex]}</p>
            <p className="text-sm text-muted-foreground">
              This may take up to 1 minute
            </p>
            {elapsed > 10 && (
              <p className="text-xs text-muted-foreground">
                {elapsed}s elapsed
              </p>
            )}
          </div>
          {onCancel && elapsed > 5 && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
