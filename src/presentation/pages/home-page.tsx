import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Compass, Flame, TrendingUp } from "lucide-react";
import { movieRepository, libraryRepository } from "../lib/services.js";
import { getTrendingMovies } from "../../application/use-cases/get-trending-movies.js";
import { useToggleLibraryMovie } from "../hooks/use-toggle-library-movie.js";
import { MovieGrid } from "../components/movie-grid.js";
import { ErrorState } from "../components/error-state.js";
import { TEXTS } from "../texts/es.js";

export function HomePage() {
  const [timeWindow, setTimeWindow] = useState<"day" | "week">("week");

  // Fetch trending movies
  const {
    data: trendingMovies,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["trending", timeWindow],
    queryFn: () => getTrendingMovies(movieRepository, timeWindow),
  });

  // Fetch saved library movies to calculate saved set
  const { data: savedMovies } = useQuery({
    queryKey: ["library-saved-movies"],
    queryFn: () => libraryRepository.getAll(),
  });

  const savedMovieIds = new Set(savedMovies?.map((m) => m.id) ?? []);

  // Toggle save mutation
  const toggleSaveMutation = useToggleLibraryMovie();

  return (
    <div className="flex flex-col gap-10">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 p-8 sm:p-12 border border-slate-800/80 shadow-2xl">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold w-fit">
            <Flame className="w-3.5 h-3.5" />
            <span>{TEXTS.app.tagline}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {TEXTS.home.heroTitle}
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {TEXTS.home.heroSubtitle}
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50"
            >
              <Compass className="w-4 h-4" />
              <span>{TEXTS.home.exploreCta}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              {TEXTS.home.trendingTitle}
            </h2>
          </div>

          {/* Time Window Switcher */}
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 w-fit">
            <button
              type="button"
              onClick={() => setTimeWindow("day")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeWindow === "day"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {TEXTS.home.trendingDay}
            </button>

            <button
              type="button"
              onClick={() => setTimeWindow("week")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeWindow === "week"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {TEXTS.home.trendingWeek}
            </button>
          </div>
        </div>

        {/* Movies Grid */}
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : (
          <MovieGrid
            movies={trendingMovies}
            isLoading={isLoading}
            savedMovieIds={savedMovieIds}
            onToggleSave={(movie) => toggleSaveMutation.mutate(movie)}
          />
        )}
      </section>
    </div>
  );
}
