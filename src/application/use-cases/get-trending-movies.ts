import type { Movie } from "../../domain/movie.js";
import type { MovieRepository } from "../ports/movie-repository.js";

export async function getTrendingMovies(
  movieRepository: MovieRepository,
  timeWindow: "day" | "week" = "day",
): Promise<Movie[]> {
  return movieRepository.getTrending(timeWindow);
}
