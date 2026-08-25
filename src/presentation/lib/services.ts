import { TmdbClient } from "../../infrastructure/http/tmdb-client.js";
import { TmdbMovieRepository } from "../../infrastructure/tmdb/tmdb-movie-repository.js";
import { LocalLibraryRepository } from "../../infrastructure/storage/local-library-repository.js";

const tmdbClient = new TmdbClient();
export const movieRepository = new TmdbMovieRepository(tmdbClient);
export const libraryRepository = new LocalLibraryRepository();
