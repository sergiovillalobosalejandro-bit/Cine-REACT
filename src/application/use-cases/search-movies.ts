import type {
  MovieRepository,
  SearchResult,
} from "../ports/movie-repository.js";

export async function searchMovies(
  movieRepository: MovieRepository,
  query: string,
  page?: number,
): Promise<SearchResult> {
  if (!query || query.trim() === "") {
    return { movies: [], totalPages: 0, currentPage: 1 };
  }

  return movieRepository.search(query.trim(), page);
}
