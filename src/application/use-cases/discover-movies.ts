import type { Movie } from "../../domain/movie.js";
import type {
  MovieRepository,
  DiscoverParams,
} from "../ports/movie-repository.js";

export async function discoverMovies(
  movieRepository: MovieRepository,
  params: DiscoverParams,
): Promise<Movie[]> {
  return movieRepository.discover(params);
}
