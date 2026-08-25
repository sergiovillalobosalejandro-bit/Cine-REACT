import type { Movie } from "../../domain/movie.js";

export interface MovieRepository {
  getTrending(timeWindow: "day" | "week"): Promise<Movie[]>;
  discover(params: DiscoverParams): Promise<Movie[]>;
  search(query: string, page?: number): Promise<SearchResult>;
  getDetails(movieId: number): Promise<Movie>;
  getRecommendations(movieId: number): Promise<Movie[]>;
}

export interface DiscoverParams {
  genre?: number;
  year?: number;
  voteAverageMin?: number;
  voteCountMin?: number;
  sortBy?: "popularity" | "vote_average" | "vote_count" | "release_date";
  page?: number;
}

export interface SearchResult {
  movies: Movie[];
  totalPages: number;
  currentPage: number;
}
