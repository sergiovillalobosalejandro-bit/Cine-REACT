import type { Movie } from "../../domain/movie.js";

export interface MovieRepository {
  getTrending(timeWindow: "day" | "week"): Promise<Movie[]>;
  discover(params: DiscoverParams): Promise<Movie[]>;
  search(query: string, page?: number): Promise<SearchResult>;
  getDetails(movieId: number): Promise<Movie>;
  getRecommendations(movieId: number): Promise<Movie[]>;
}

export interface DiscoverParams {
  genre?: number | undefined;
  year?: number | undefined;
  voteAverageMin?: number | undefined;
  voteCountMin?: number | undefined;
  sortBy?:
    "popularity" | "vote_average" | "vote_count" | "release_date" | undefined;
  page?: number | undefined;
}

export interface SearchResult {
  movies: Movie[];
  totalPages: number;
  currentPage: number;
}
