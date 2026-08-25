import type { Movie } from "../../domain/movie.js";
import type { MovieRepository } from "../ports/movie-repository.js";

export async function getMovieDetails(
  movieRepository: MovieRepository,
  movieId: number,
): Promise<Movie> {
  if (movieId <= 0) {
    throw new Error("Invalid movie ID");
  }

  return movieRepository.getDetails(movieId);
}
