import { useSearchParams } from "react-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { Compass, Loader2, AlertCircle } from "lucide-react";
import { movieRepository, libraryRepository } from "../lib/services.js";
import { discoverMovies } from "../../application/use-cases/discover-movies.js";
import { useToggleLibraryMovie } from "../hooks/use-toggle-library-movie.js";
import type { Movie } from "../../domain/movie.js";
import {
  parseExploreParams,
  normalizeExploreParams,
  buildSearchParams,
  hasActiveFilters,
  DEFAULT_EXPLORE_PARAMS,
  type ValidatedExploreParams,
} from "../lib/explore-params.js";
import { Filters } from "../components/filters.js";
import { MovieGrid } from "../components/movie-grid.js";
import { ErrorState } from "../components/error-state.js";
import { EmptyState } from "../components/empty-state.js";
import { TEXTS } from "../texts/es.js";

const MAX_PAGES = 500;

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Validate URLSearchParams with Zod
  const validatedParams = parseExploreParams(searchParams);
  const normalizedKey = normalizeExploreParams(validatedParams);
  const isFiltered = hasActiveFilters(validatedParams);

  // Infinite query for discover movies
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["discover-infinite", normalizedKey],
    queryFn: ({ pageParam = 1 }) =>
      discoverMovies(movieRepository, {
        ...validatedParams,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      const nextPage = allPages.length + 1;
      if (nextPage > MAX_PAGES) return undefined;
      return nextPage;
    },
  });

  // Fetch saved library movies to calculate saved set
  const { data: savedMovies } = useQuery({
    queryKey: ["library-saved-movies"],
    queryFn: () => libraryRepository.getAll(),
  });

  const savedMovieIds = new Set(savedMovies?.map((m) => m.id) ?? []);

  // Toggle save mutation
  const toggleSaveMutation = useToggleLibraryMovie();

  const handleFilterChange = (newParams: ValidatedExploreParams) => {
    setSearchParams(buildSearchParams(newParams), { replace: true });
  };

  const handleClearFilters = () => {
    setSearchParams(buildSearchParams(DEFAULT_EXPLORE_PARAMS), {
      replace: true,
    });
  };

  // Flatten all page results into a single movie array
  const allMovies = data?.pages.flat() ?? [];
  const currentTotalPages = data?.pages.length ?? 0;
  const isMaxPageReached = currentTotalPages >= MAX_PAGES;

  return (
    <div className="flex flex-col gap-8">
      {/* Header section */}
      <div className="flex flex-col gap-2 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            {TEXTS.explore.title}
          </h1>
        </div>
        <p className="text-slate-400 text-sm max-w-xl">
          {TEXTS.explore.subtitle}
        </p>
      </div>

      {/* Filters Bar (lives in URLSearchParams) */}
      <Filters params={validatedParams} onChange={handleFilterChange} />

      {/* State 1: Error State */}
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        /* State 2: Loading State with Skeletons */
        <MovieGrid isLoading skeletonCount={10} />
      ) : allMovies.length === 0 ? (
        /* State 3 & 4: Empty States */
        isFiltered ? (
          /* State 4: Filtered Empty State with Reset Filters CTA */
          <EmptyState
            title={TEXTS.explore.emptyFilterTitle}
            description={TEXTS.explore.emptyFilterDesc}
            actionLabel={TEXTS.explore.clearFilters}
            onAction={handleClearFilters}
          />
        ) : (
          /* State 3: Initial Empty State */
          <EmptyState />
        )
      ) : (
        /* Movie Grid with Infinite Scroll */
        <div className="flex flex-col gap-8">
          <MovieGrid
            movies={allMovies}
            savedMovieIds={savedMovieIds}
            onToggleSave={(movie) => toggleSaveMutation.mutate(movie)}
          />

          {/* Infinite Scroll Load More Controls */}
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            {hasNextPage && !isMaxPageReached && (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 disabled:opacity-50"
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{TEXTS.explore.loadingMore}</span>
                  </>
                ) : (
                  <span>{TEXTS.explore.loadMore}</span>
                )}
              </button>
            )}

            {/* Max Page Limit (500) Notice */}
            {isMaxPageReached && (
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 text-amber-300 rounded-xl border border-amber-500/20 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{TEXTS.explore.maxPageReached}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
