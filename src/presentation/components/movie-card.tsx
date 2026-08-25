import { Link } from "react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { Movie } from "../../domain/movie.js";
import { Poster } from "./poster.js";
import { RatingBadge } from "./rating.js";
import { TEXTS } from "../texts/es.js";

interface MovieCardProps {
  movie: Movie;
  isSaved?: boolean;
  onToggleSave?: (movie: Movie) => void;
  onRemove?: (movieId: number) => void;
}

export function MovieCard({
  movie,
  isSaved = false,
  onToggleSave,
  onRemove,
}: MovieCardProps) {
  const releaseYear = movie.releaseDate
    ? movie.releaseDate.getFullYear()
    : null;

  return (
    <div className="group relative flex flex-col bg-slate-900/80 rounded-xl overflow-hidden border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1">
      <Link
        to={`/movies/${movie.id}`}
        className="block overflow-hidden aspect-[2/3] relative"
      >
        <Poster
          path={movie.posterPath}
          title={movie.title}
          size="w342"
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
      </Link>

      {/* Quick Save Bookmark Button */}
      {onToggleSave && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSave(movie);
          }}
          title={
            isSaved
              ? TEXTS.movieDetail.inLibrary
              : TEXTS.movieDetail.addToLibrary
          }
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? "bg-indigo-600/90 text-white shadow-md shadow-indigo-600/30 scale-105"
              : "bg-slate-950/60 text-slate-300 hover:bg-slate-900 hover:text-white"
          }`}
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      )}

      {onRemove && !onToggleSave && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(movie.id);
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-rose-600/80 text-white backdrop-blur-md hover:bg-rose-600 transition-all"
        >
          &times;
        </button>
      )}

      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <Link
            to={`/movies/${movie.id}`}
            className="font-semibold text-sm text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1"
            title={movie.title}
          >
            {movie.title}
          </Link>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{releaseYear ?? TEXTS.movieDetail.notAvailable}</span>
          <RatingBadge rating={movie.rating} />
        </div>
      </div>
    </div>
  );
}
