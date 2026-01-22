'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import type { Database } from '@/types/database'

type Game = Database['public']['Tables']['games']['Row']

interface GameCardProps {
  game: Game
  onEdit: () => void
  onDelete: () => void
  onView: () => void
}

export function GameCard({ game, onEdit, onDelete, onView }: GameCardProps) {
  const gameDate = parseISO(game.game_date)
  const isUpcoming = game.game_date >= new Date().toISOString().split('T')[0]

  const getStatusBadge = () => {
    switch (game.status) {
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>
      default:
        return <Badge variant="outline">Scheduled</Badge>
    }
  }

  const formatTime = (time: string | null) => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">
              vs {game.opponent || 'TBD'}
            </h3>
            {getStatusBadge()}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{format(gameDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          {game.game_time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatTime(game.game_time)}</span>
            </div>
          )}
          {game.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{game.location}</span>
            </div>
          )}
        </div>

        {game.status === 'completed' && game.our_score !== null && game.their_score !== null && (
          <div className="pt-2 border-t">
            <p className="text-lg font-semibold">
              Final: {game.our_score} - {game.their_score}
              {game.our_score > game.their_score && (
                <span className="text-green-600 ml-2 text-sm">W</span>
              )}
              {game.our_score < game.their_score && (
                <span className="text-red-600 ml-2 text-sm">L</span>
              )}
              {game.our_score === game.their_score && (
                <span className="text-muted-foreground ml-2 text-sm">T</span>
              )}
            </p>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={onView}
        >
          {isUpcoming ? 'Set Up Lineup' : 'View Details'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  )
}
