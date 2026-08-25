import { Film } from "lucide-react";
import { env } from "../../config/env.js";

interface PosterProps {
  path: string | null;
  title: string;
  size?: "w185" | "w342" | "w500" | "original";
  className?: string;
}

export function Poster({
  path,
  title,
  size = "w342",
  className = "",
}: PosterProps) {
  if (!path) {
    return (
      <div
        role="img"
        aria-label={`Póster no disponible para ${title}`}
        className={`flex flex-col items-center justify-center bg-slate-800 text-slate-400 p-4 text-center select-none ${className}`}
      >
        <Film className="w-10 h-10 mb-2 opacity-50 text-indigo-400" />
        <span className="text-xs font-medium line-clamp-3">{title}</span>
      </div>
    );
  }

  const imageUrl = `${env.VITE_TMDB_IMAGE_BASE}/${size}${path}`;

  return (
    <img
      src={imageUrl}
      alt={title}
      loading="lazy"
      className={`object-cover ${className}`}
      onError={(e) => {
        // Fallback on image load error
        (e.currentTarget as HTMLElement).style.display = "none";
      }}
    />
  );
}
