import type { Movie } from "../../domain/movie.js";
import { MovieCard } from "./movie-card.js";
import { MovieCardSkeleton } from "./movie-card-skeleton.js";
import { EmptyState } from "./empty-state.js";

interface MovieGridProps {
  movies?: Movie[] | undefined;
  isLoading?: boolean | undefined;
  savedMovieIds?: Set<number> | undefined;
  onToggleSave?: ((movie: Movie) => void) | undefined;
  onRemoveMovie?: ((movieId: number) => void) | undefined;
  emptyTitle?: string | undefined;
  emptyDesc?: string | undefined;
  skeletonCount?: number | undefined;
}

export function MovieGrid({
  movies,
  isLoading = false,
  savedMovieIds,
  onToggleSave,
  onRemoveMovie,
  emptyTitle,
  emptyDesc,
  skeletonCount = 10,
}: MovieGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // "undefined" y "[]" NO significan lo mismo:
  //   undefined -> la consulta todavia no entrego datos (arrancando,
  //                reintentando o pausada). No sabemos si hay resultados.
  //   []        -> la consulta respondio y no hay resultados.
  // Confundirlos hacia que un fallo de conexion se mostrara al usuario
  // como "no se encontraron peliculas", que es mentira.
  if (movies === undefined) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDesc} />;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isSaved={savedMovieIds?.has(movie.id)}
          onToggleSave={onToggleSave}
          onRemove={onRemoveMovie}
        />
      ))}
    </div>
  );
}
