"use client"

import { useState } from "react"
import { Star } from "lucide-react"

interface StarRatingProps {
  rating: number
  onRatingChange?: (rating: number) => void
  size?: "sm" | "md" | "lg"
  readonly?: boolean
}

export function StarRating({ rating, onRatingChange, size = "md", readonly = false }: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState(0)

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  const handleStarClick = (star: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(star)
    }
  }

  const handleMouseEnter = (star: number) => {
    if (!readonly) {
      setHoveredStar(star)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredStar(0)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            readonly ? "" : "cursor-pointer"
          } transition-colors ${
            star <= (hoveredStar || rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
      <span className="text-sm text-gray-600 ml-2">({rating}.0)</span>
    </div>
  )
}