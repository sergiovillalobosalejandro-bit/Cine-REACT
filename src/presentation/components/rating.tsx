import { Star } from "lucide-react";
import type { Rating as RatingType } from "../../domain/rating.js";
import { formatRating } from "../../domain/rating.js";
import { TEXTS } from "../texts/es.js";

interface RatingProps {
  rating: RatingType;
  className?: string;
  showCount?: boolean;
}

export function RatingBadge({
  rating,
  className = "",
  showCount = false,
}: RatingProps) {
  if (rating.kind === "no-votes") {
    return (
      <div
        className={`inline-flex items-center gap-1 text-slate-400 text-xs ${className}`}
      >
        <Star className="w-3.5 h-3.5 text-slate-500" />
        <span>{TEXTS.movieDetail.noVotes}</span>
      </div>
    );
  }

  const formatted = formatRating(rating, "es-ES");
  const isEstablished = rating.kind === "established";

  return (
    <div
      className={`inline-flex items-center gap-1 text-xs font-semibold ${className}`}
    >
      <Star
        className={`w-3.5 h-3.5 ${isEstablished ? "text-amber-400 fill-amber-400" : "text-amber-300"}`}
      />
      <span className="text-slate-100">{formatted}</span>
      <span className="text-slate-400 text-[10px]">/10</span>
      {showCount && (
        <span className="text-slate-400 text-[11px] ml-1">
          ({rating.voteCount.toLocaleString("es-ES")})
        </span>
      )}
    </div>
  );
}
