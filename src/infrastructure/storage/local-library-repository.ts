import { z } from "zod";
import type { Movie } from "../../domain/movie.js";
import type {
  LibraryRepository,
  MovieList,
} from "../../application/ports/library-repository.js";

const LIBRARY_KEY = "cineteca-library-v1";

// Schemas for localStorage validation
const StoredMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  originalTitle: z.string().nullable(),
  overview: z.string().nullable(),
  posterPath: z.string().nullable(),
  releaseDate: z.string().nullable(),
  runtime: z.number().nullable(),
  genres: z.array(z.object({ id: z.number(), name: z.string() })),
  budget: z
    .object({ amountMinor: z.number(), currency: z.literal("USD") })
    .nullable(),
  status: z.object({ kind: z.string() }),
  rating: z.object({ kind: z.string() }),
});

const StoredMovieListSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  movieIds: z.array(z.number()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const LibraryDataSchema = z.object({
  movies: z.array(StoredMovieSchema),
  lists: z.array(StoredMovieListSchema),
});

function createEmptyLibrary(): z.infer<typeof LibraryDataSchema> {
  return {
    movies: [],
    lists: [],
  };
}

export class LocalLibraryRepository implements LibraryRepository {
  #loadLibrary(): z.infer<typeof LibraryDataSchema> {
    const data = globalThis.localStorage.getItem(LIBRARY_KEY);
    if (!data) return createEmptyLibrary();

    try {
      const parsed = JSON.parse(data);
      const result = LibraryDataSchema.safeParse(parsed);
      if (result.success) {
        return result.data;
      }
      // Data is corrupt, return empty library
      return createEmptyLibrary();
    } catch {
      // JSON parse failed, return empty library
      return createEmptyLibrary();
    }
  }

  #saveLibrary(data: z.infer<typeof LibraryDataSchema>): void {
    globalThis.localStorage.setItem(LIBRARY_KEY, JSON.stringify(data));
  }

  #convertStoredMovieToMovie(stored: z.infer<typeof StoredMovieSchema>): Movie {
    return {
      ...stored,
      releaseDate: stored.releaseDate ? new Date(stored.releaseDate) : null,
    } as Movie;
  }

  #convertMovieToStoredMovie(movie: Movie): z.infer<typeof StoredMovieSchema> {
    return {
      ...movie,
      releaseDate: movie.releaseDate ? movie.releaseDate.toISOString() : null,
    };
  }

  #convertStoredListToMovieList(
    stored: z.infer<typeof StoredMovieListSchema>,
  ): MovieList {
    return {
      ...stored,
      createdAt: new Date(stored.createdAt),
      updatedAt: new Date(stored.updatedAt),
    };
  }

  #convertMovieListToStoredList(
    list: MovieList,
  ): z.infer<typeof StoredMovieListSchema> {
    return {
      ...list,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
    };
  }

  async getAll(): Promise<Movie[]> {
    const library = this.#loadLibrary();
    return library.movies.map((m) => this.#convertStoredMovieToMovie(m));
  }

  async getById(movieId: number): Promise<Movie | null> {
    const library = this.#loadLibrary();
    const movie = library.movies.find((m) => m.id === movieId);
    return movie ? this.#convertStoredMovieToMovie(movie) : null;
  }

  async save(movie: Movie): Promise<void> {
    const library = this.#loadLibrary();
    const existingIndex = library.movies.findIndex((m) => m.id === movie.id);
    const storedMovie = this.#convertMovieToStoredMovie(movie);

    if (existingIndex >= 0) {
      library.movies[existingIndex] = storedMovie;
    } else {
      library.movies.push(storedMovie);
    }

    this.#saveLibrary(library);
  }

  async remove(movieId: number): Promise<void> {
    const library = this.#loadLibrary();
    library.movies = library.movies.filter((m) => m.id !== movieId);
    this.#saveLibrary(library);
  }

  async exists(movieId: number): Promise<boolean> {
    const movie = await this.getById(movieId);
    return movie !== null;
  }

  async getLists(): Promise<MovieList[]> {
    const library = this.#loadLibrary();
    return library.lists.map((l) => this.#convertStoredListToMovieList(l));
  }

  async createList(name: string, description?: string): Promise<MovieList> {
    const library = this.#loadLibrary();
    const now = new Date();
    const newList: MovieList = {
      id: crypto.randomUUID(),
      name,
      description: description ?? null,
      movieIds: [],
      createdAt: now,
      updatedAt: now,
    };

    library.lists.push(this.#convertMovieListToStoredList(newList));
    this.#saveLibrary(library);

    return newList;
  }

  async updateList(
    listId: string,
    name: string,
    description?: string,
  ): Promise<MovieList> {
    const library = this.#loadLibrary();
    const listIndex = library.lists.findIndex((l) => l.id === listId);

    if (listIndex < 0) {
      throw new Error("List not found");
    }

    const stored = library.lists[listIndex]!;
    stored.name = name;
    stored.description = description ?? null;
    stored.updatedAt = new Date().toISOString();
    library.lists[listIndex] = stored;
    this.#saveLibrary(library);

    return this.#convertStoredListToMovieList(stored);
  }

  async addToList(listId: string, movieId: number): Promise<void> {
    const library = this.#loadLibrary();
    const listIndex = library.lists.findIndex((l) => l.id === listId);

    if (listIndex < 0) {
      throw new Error("List not found");
    }

    const list = library.lists[listIndex]!;
    if (!list.movieIds.includes(movieId)) {
      list.movieIds.push(movieId);
      list.updatedAt = new Date().toISOString();
      library.lists[listIndex] = list;
      this.#saveLibrary(library);
    }
  }

  async removeFromList(listId: string, movieId: number): Promise<void> {
    const library = this.#loadLibrary();
    const listIndex = library.lists.findIndex((l) => l.id === listId);

    if (listIndex < 0) {
      throw new Error("List not found");
    }

    const list = library.lists[listIndex]!;
    list.movieIds = list.movieIds.filter((id) => id !== movieId);
    list.updatedAt = new Date().toISOString();
    library.lists[listIndex] = list;
    this.#saveLibrary(library);
  }

  async deleteList(listId: string): Promise<void> {
    const library = this.#loadLibrary();
    library.lists = library.lists.filter((l) => l.id !== listId);
    this.#saveLibrary(library);
  }
}
