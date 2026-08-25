import type {
  LibraryRepository,
  MovieList,
} from "../ports/library-repository.js";

export async function getAllLists(
  libraryRepository: LibraryRepository,
): Promise<MovieList[]> {
  return libraryRepository.getLists();
}

export async function createList(
  libraryRepository: LibraryRepository,
  name: string,
  description?: string,
): Promise<MovieList> {
  if (!name || name.trim() === "") {
    throw new Error("List name cannot be empty");
  }

  return libraryRepository.createList(name.trim(), description?.trim());
}

export async function updateList(
  libraryRepository: LibraryRepository,
  listId: string,
  name: string,
  description?: string,
): Promise<MovieList> {
  if (!listId || listId.trim() === "") {
    throw new Error("List ID cannot be empty");
  }

  if (!name || name.trim() === "") {
    throw new Error("List name cannot be empty");
  }

  return libraryRepository.updateList(
    listId.trim(),
    name.trim(),
    description?.trim(),
  );
}

export async function addMovieToList(
  libraryRepository: LibraryRepository,
  listId: string,
  movieId: number,
): Promise<void> {
  if (!listId || listId.trim() === "") {
    throw new Error("List ID cannot be empty");
  }

  if (movieId <= 0) {
    throw new Error("Invalid movie ID");
  }

  await libraryRepository.addToList(listId.trim(), movieId);
}

export async function removeMovieFromList(
  libraryRepository: LibraryRepository,
  listId: string,
  movieId: number,
): Promise<void> {
  if (!listId || listId.trim() === "") {
    throw new Error("List ID cannot be empty");
  }

  if (movieId <= 0) {
    throw new Error("Invalid movie ID");
  }

  await libraryRepository.removeFromList(listId.trim(), movieId);
}

export async function deleteList(
  libraryRepository: LibraryRepository,
  listId: string,
): Promise<void> {
  if (!listId || listId.trim() === "") {
    throw new Error("List ID cannot be empty");
  }

  await libraryRepository.deleteList(listId.trim());
}
