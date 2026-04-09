"use client";

import { Star } from "lucide-react";

type Props = {
  rating?: number; // e.g. 4.3
  totalReviews?: number; // optional
};

const Ratings = ({ rating = 0, totalReviews }: Props) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-2">
      {/* Stars */}
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return (
              <Star
                key={index}
                size={16}
                className="text-yellow-400 fill-yellow-400"
              />
            );
          }

          if (index === fullStars && hasHalf) {
            return (
              <Star
                key={index}
                size={16}
                className="text-yellow-400 fill-yellow-200"
              />
            );
          }

          return <Star key={index} size={16} className="text-gray-400" />;
        })}
      </div>

      {/* Rating number */}
      <span className="text-sm text-gray-300">{rating.toFixed(1)}</span>

      {/* Reviews count */}
      {totalReviews && (
        <span className="text-xs text-gray-400">({totalReviews})</span>
      )}
    </div>
  );
};

export default Ratings;
