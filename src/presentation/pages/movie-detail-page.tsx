import { useState } from "react";
import { useParams } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  BookmarkCheck,
  Plus,
  Calendar,
  Clock,
  DollarSign,
  Tag,
  CheckCircle2,
  Sparkles,
  X,
  Globe2,
  Clapperboard,
  Users,
  Video,
} from "lucide-react";
import { movieRepository, libraryRepository } from "../lib/services.js";
import { getMovieDetails } from "../../application/use-cases/get-movie-details.js";
import { useToggleLibraryMovie } from "../hooks/use-toggle-library-movie.js";
import { useAddMovieToList } from "../hooks/use-list-mutations.js";
import type { Movie } from "../../domain/movie.js";
import { Poster } from "../components/poster.js";
import { RatingBadge } from "../components/rating.js";
import { MovieGrid } from "../components/movie-grid.js";
import { ErrorState } from "../components/error-state.js";
import { TEXTS } from "../texts/es.js";
import { formatMoney } from "../../domain/money.js";
import { formatMovieStatus } from "../../domain/formatters.js";

export function MovieDetailPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const idNum = Number(movieId);

  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState("");
  const queryClient = useQueryClient();

  // Movie Details query (includes credits, videos, and English overview fallback)
  const {
    data: movie,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["movie-details", idNum],
    queryFn: ({ signal }) => movieRepository.getDetails(idNum, { signal }),
    enabled: Boolean(idNum),
  });

  // Recommendations query
  const { data: recommendations } = useQuery({
    queryKey: ["movie-recommendations", idNum],
    queryFn: ({ signal }) =>
      movieRepository.getRecommendations(idNum, { signal }),
    enabled: Boolean(idNum),
  });

  // Saved library movies query
  const { data: savedMovies } = useQuery({
    queryKey: ["library-saved-movies"],
    queryFn: () => libraryRepository.getAll(),
  });

  // Lists query
  const { data: lists } = useQuery({
    queryKey: ["library-lists"],
    queryFn: () => libraryRepository.getLists(),
  });

  const isSaved = savedMovies?.some((m) => m.id === idNum) ?? false;

  // Toggle Save Mutation
  const toggleSaveMutation = useToggleLibraryMovie();

  // Add to List Mutation
  const addToListMutation = useAddMovieToList();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-96 bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  if (isError || !movie) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const releaseDateFormatted = movie.releaseDate
    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(
        movie.releaseDate,
      )
    : TEXTS.movieDetail.notAvailable;

  const budgetFormatted = movie.budget
    ? formatMoney(movie.budget, "es-ES")
    : TEXTS.movieDetail.notAvailable;

  const runtimeFormatted = movie.runtime
    ? `${movie.runtime} ${TEXTS.movieDetail.minutes}`
    : TEXTS.movieDetail.notAvailable;

  const statusFormatted = formatMovieStatus(movie.status);

  return (
    <div className="flex flex-col gap-12">
      {/* Movie Details Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row gap-8">
        {/* Poster */}
        <div className="w-48 sm:w-64 shrink-0 mx-auto md:mx-0 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
          <Poster
            path={movie.posterPath}
            title={movie.title}
            size="w500"
            className="w-full h-auto"
          />
        </div>

        {/* Info Content */}
        <div className="flex flex-col flex-1 gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <RatingBadge
                rating={movie.rating}
                showCount
                className="text-sm"
              />
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                {statusFormatted}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {movie.title}
            </h1>
            {movie.originalTitle && movie.originalTitle !== movie.title && (
              <p className="text-sm text-slate-400 italic">
                Título original: {movie.originalTitle}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => toggleSaveMutation.mutate(movie)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
                isSaved
                  ? "bg-rose-600/90 text-white hover:bg-rose-600 shadow-rose-600/30"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30"
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              <span>
                {isSaved
                  ? TEXTS.movieDetail.removeFromLibrary
                  : TEXTS.movieDetail.addToLibrary}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsListModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition-all"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>{TEXTS.movieDetail.addToList}</span>
            </button>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {TEXTS.movieDetail.releaseDate}
              </span>
              <span className="text-slate-200 font-semibold">
                {releaseDateFormatted}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {TEXTS.movieDetail.runtime}
              </span>
              <span className="text-slate-200 font-semibold">
                {runtimeFormatted}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
                {TEXTS.movieDetail.budget}
              </span>
              <span className="text-slate-200 font-semibold">
                {budgetFormatted}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                {TEXTS.movieDetail.genres}
              </span>
              <span className="text-slate-200 font-semibold line-clamp-1">
                {movie.genres.map((g) => g.name).join(", ") ||
                  TEXTS.movieDetail.notAvailable}
              </span>
            </div>
          </div>

          {/* Director & Cast section */}
          {(movie.director || (movie.cast && movie.cast.length > 0)) && (
            <div className="flex flex-col gap-3 pt-2">
              {movie.director && (
                <div className="flex items-center gap-2 text-xs">
                  <Clapperboard className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-400 font-medium">
                    {TEXTS.movieDetail.director}:
                  </span>
                  <span className="text-slate-200 font-semibold">
                    {movie.director}
                  </span>
                </div>
              )}

              {movie.cast && movie.cast.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    {TEXTS.movieDetail.cast}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast.map((actor) => (
                      <span
                        key={actor.id}
                        className="px-2.5 py-1 bg-slate-800/80 text-slate-300 text-xs rounded-lg border border-slate-700/60"
                      >
                        {actor.name}{" "}
                        {actor.character ? `(${actor.character})` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Synopsis / Overview Section */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              {TEXTS.movieDetail.overview}
            </h3>

            {/* Notice if overview is fetched in English fallback */}
            {movie.overviewLanguage === "en" && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold rounded-xl w-fit mb-1">
                <Globe2 className="w-4 h-4" />
                <span>{TEXTS.movieDetail.englishOverviewNotice}</span>
              </div>
            )}

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {movie.overview || TEXTS.movieDetail.noOverview}
            </p>
          </div>

          {/* YouTube Trailer Section */}
          {movie.trailerKey && (
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/80">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-400" />
                <span>{TEXTS.movieDetail.trailer}</span>
              </h3>
              <div className="aspect-video w-full max-w-2xl rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                <iframe
                  src={`https://www.youtube.com/embed/${movie.trailerKey}`}
                  title={`${movie.title} Tráiler`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              {TEXTS.movieDetail.recommendations}
            </h2>
          </div>

          <MovieGrid
            movies={recommendations.slice(0, 10)}
            savedMovieIds={new Set(savedMovies?.map((m) => m.id) ?? [])}
            onToggleSave={(mov) => toggleSaveMutation.mutate(mov)}
          />
        </section>
      )}

      {/* Modal: Add to List */}
      {isListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100">
                {TEXTS.movieDetail.addToList}
              </h3>
              <button
                type="button"
                onClick={() => setIsListModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!lists || lists.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">
                {TEXTS.library.listsEmptyTitle}
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {lists.map((list) => {
                  const alreadyInList = list.movieIds.includes(movie.id);
                  return (
                    <button
                      key={list.id}
                      type="button"
                      disabled={alreadyInList}
                      onClick={() => setSelectedListId(list.id)}
                      className={`flex items-center justify-between p-3 rounded-xl text-left border transition-all ${
                        selectedListId === list.id
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-200"
                          : "bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800"
                      } ${alreadyInList ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div>
                        <span className="font-semibold text-sm block">
                          {list.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {list.movieIds.length} {TEXTS.library.movieCount}
                        </span>
                      </div>
                      {alreadyInList && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsListModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                {TEXTS.library.cancel}
              </button>

              <button
                type="button"
                disabled={!selectedListId || addToListMutation.isPending}
                onClick={() => {
                  addToListMutation.mutate(
                    { listId: selectedListId, movieId: movie.id },
                    {
                      onSuccess: () => {
                        setIsListModalOpen(false);
                        setSelectedListId("");
                      },
                    },
                  );
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
              >
                {TEXTS.library.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
