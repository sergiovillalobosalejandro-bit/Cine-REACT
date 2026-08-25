import type { Money } from "./money.js";
import type { MovieStatus } from "./movie-status.js";
import type { Rating } from "./rating.js";
import { createMovieStatus } from "./movie-status.js";
import { createRating } from "./rating.js";

export type Genre = {
  id: number;
  name: string;
};

export type CastMember = {
  id: number;
  name: string;
  character: string | null;
  profilePath: string | null;
};

export type Movie = {
  id: number;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  overviewLanguage?: "es" | "en";
  posterPath: string | null;
  releaseDate: Date | null;
  runtime: number | null;
  genres: Genre[];
  budget: Money | null;
  status: MovieStatus;
  rating: Rating;
  director?: string | null;
  cast?: CastMember[];
  trailerKey?: string | null;
};

export function createMovie(data: {
  id: number;
  title: string;
  original_title: string | null | undefined;
  overview: string | null | undefined;
  overviewLanguage?: "es" | "en";
  poster_path: string | null | undefined;
  release_date: string | null | undefined;
  runtime: number | null | undefined;
  genres: Array<{ id: number; name: string } | null | undefined>;
  budget: number | null | undefined;
  vote_count: number | null | undefined;
  vote_average: number | null | undefined;
  director?: string | null;
  cast?: CastMember[];
  trailerKey?: string | null;
}): Movie {
  const {
    id,
    title,
    original_title,
    overview,
    poster_path,
    release_date,
    runtime,
    genres,
    budget,
    vote_count,
    vote_average,
  } = data;

  // Convert TMDB null/empty/zero values to explicit null or variants
  const originalTitle =
    original_title && original_title !== "" ? original_title : null;
  const movieOverview = overview && overview !== "" ? overview : null;
  const posterPath = poster_path && poster_path !== "" ? poster_path : null;
  const movieRuntime = runtime && runtime > 0 ? runtime : null;
  const movieBudget = budget && budget > 0 ? budget : null;

  // Filter out null/undefined genres and empty names
  const validGenres = genres
    .filter(
      (g): g is { id: number; name: string } => g != null && g.name !== "",
    )
    .map((g) => ({ id: g.id, name: g.name }));

  // Create Money from budget
  const budgetMoney =
    movieBudget !== null
      ? { amountMinor: movieBudget * 100, currency: "USD" as const }
      : null;

  // Create MovieStatus
  const status = createMovieStatus(release_date);

  // Create Rating
  const rating = createRating(vote_count, vote_average);

  return {
    id,
    title,
    originalTitle,
    overview: movieOverview,
    overviewLanguage: data.overviewLanguage,
    posterPath,
    releaseDate:
      release_date && release_date !== "" ? new Date(release_date) : null,
    runtime: movieRuntime,
    genres: validGenres,
    budget: budgetMoney,
    status,
    rating,
    director: data.director,
    cast: data.cast,
    trailerKey: data.trailerKey,
  };
}
