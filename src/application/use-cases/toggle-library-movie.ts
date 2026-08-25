import type { Movie } from "../../domain/movie.js";
import type { LibraryRepository } from "../ports/library-repository.js";

export async function toggleLibraryMovie(
  libraryRepository: LibraryRepository,
  movie: Movie,
): Promise<void> {
  const exists = await libraryRepository.exists(movie.id);

  if (exists) {
    await libraryRepository.remove(movie.id);
  } else {
    await libraryRepository.save(movie);
  }
}
