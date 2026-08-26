import { useState } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { movieRepository, libraryRepository } from "../lib/services.js";
import { useToggleLibraryMovie } from "../hooks/use-toggle-library-movie.js";
import { useDebounce } from "../hooks/use-debounce.js";
import { MovieGrid } from "../components/movie-grid.js";
import { ErrorState } from "../components/error-state.js";
import { TEXTS } from "../texts/es.js";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get("q") ?? "";
  const [page, setPage] = useState(1);

  // Apply 400ms debounce to the search query from URL
  const debouncedQuery = useDebounce(rawQuery, 400);
  const isQueryValid = debouncedQuery.trim().length >= 2;

  // Search query execution with automatic request cancellation via signal
  const {
    data: searchResult,
    isLoading,
    isError,
    isPaused,
    refetch,
  } = useQuery({
    queryKey: ["search", debouncedQuery.trim(), page],
    queryFn: ({ signal }) =>
      movieRepository.search(debouncedQuery.trim(), page, { signal }),
    enabled: isQueryValid,
  });

  // Saved movies query
  const { data: savedMovies } = useQuery({
    queryKey: ["library-saved-movies"],
    queryFn: () => libraryRepository.getAll(),
  });

  const savedMovieIds = new Set(savedMovies?.map((m) => m.id) ?? []);

  // Save toggle mutation
  const toggleSaveMutation = useToggleLibraryMovie();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Search className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {TEXTS.search.title}{" "}
            <span className="text-emerald-400">"{rawQuery}"</span>
          </h1>
        </div>

        {searchResult && isQueryValid && (
          <p className="text-slate-400 text-sm">
            {TEXTS.search.page} {searchResult.currentPage} {TEXTS.search.of}{" "}
            {searchResult.totalPages}
          </p>
        )}
      </div>

      {/* Notice if search text is shorter than 2 characters */}
      {!isQueryValid ? (
        <div className="flex items-center gap-3 p-6 bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-300 text-sm">
          <Info className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{TEXTS.search.minCharsNotice}</span>
        </div>
      ) : isError || isPaused ? (
        <ErrorState
          title={isPaused ? TEXTS.components.offlineState.title : undefined}
          description={
            isPaused ? TEXTS.components.offlineState.desc : undefined
          }
          onRetry={() => refetch()}
        />
      ) : (
        <>
          <MovieGrid
            movies={searchResult?.movies}
            isLoading={isLoading}
            savedMovieIds={savedMovieIds}
            onToggleSave={(movie) => toggleSaveMutation.mutate(movie)}
            emptyTitle={TEXTS.search.noResultsTitle}
            emptyDesc={TEXTS.search.noResultsDesc}
          />

          {/* Pagination Controls */}
          {searchResult && searchResult.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium text-xs rounded-xl border border-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{TEXTS.components.pagination.prev}</span>
              </button>

              <span className="text-xs font-semibold text-slate-400 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
                {page} / {searchResult.totalPages}
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= searchResult.totalPages || isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-medium text-xs rounded-xl border border-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <span>{TEXTS.components.pagination.next}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
