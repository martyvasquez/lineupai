'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  label,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const handleClick = (rating: number) => {
    if (readOnly || !onChange) return
    // Toggle off if clicking the same rating
    onChange(rating === value ? 0 : rating)
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            disabled={readOnly}
            className={cn(
              'focus:outline-none transition-colors',
              !readOnly && 'hover:scale-110 cursor-pointer',
              readOnly && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                rating <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-gray-300'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
