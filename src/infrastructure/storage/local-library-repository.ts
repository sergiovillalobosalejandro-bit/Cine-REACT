import { z } from "zod";
import type { Movie } from "../../domain/movie.js";
import type {
  LibraryRepository,
  MovieList,
} from "../../application/ports/library-repository.js";

const LIBRARY_KEY = "cineteca-library-v1";

// Schemas for localStorage validation.
//
// OJO con status y rating: Zod descarta por defecto cualquier clave que no
// este declarada en el schema. Con `z.object({ kind: z.string() })`, cada
// lectura de localStorage devolvia SOLO { kind } y perdia voteCount,
// average y releaseDate -- silenciosamente, sin ningun error, hasta que la
// UI intentaba formatear un numero que ya no estaba y mostraba "NaN /10".
// Por eso van como uniones discriminadas que reflejan exactamente las
// variantes del dominio (MovieStatus y Rating).
const StoredMovieStatusSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("released"), releaseDate: z.string() }),
  z.object({ kind: z.literal("unreleased"), releaseDate: z.string() }),
  z.object({ kind: z.literal("unknown") }),
]);

const StoredRatingSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("no-votes") }),
  z.object({
    kind: z.literal("few-votes"),
    voteCount: z.number(),
    average: z.number(),
  }),
  z.object({
    kind: z.literal("established"),
    voteCount: z.number(),
    average: z.number(),
  }),
]);

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
  status: StoredMovieStatusSchema,
  rating: StoredRatingSchema,
  // Mismo motivo que status/rating arriba: si no se declaran aqui, Zod
  // los descarta en cada lectura aunque el escritor los haya guardado bien.
  // Hoy ninguna pantalla los muestra para una pelicula ya guardada, pero
  // omitirlos del schema es dejar la misma trampa para la proxima feature
  // que si los use.
  overviewLanguage: z.enum(["es", "en"]).optional(),
  director: z.string().nullable().optional(),
  cast: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        character: z.string().nullable(),
        profilePath: z.string().nullable(),
      }),
    )
    .optional(),
  trailerKey: z.string().nullable().optional(),
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
    // status.releaseDate viaja como string en el almacenamiento (igual que
    // el releaseDate de nivel superior) porque JSON no tiene tipo Date.
    // Sin esta conversion, un componente que llame status.releaseDate
    // esperando un Date recibiria un string en runtime.
    const status =
      stored.status.kind === "released" || stored.status.kind === "unreleased"
        ? {
            kind: stored.status.kind,
            releaseDate: new Date(stored.status.releaseDate),
          }
        : stored.status;

    return {
      ...stored,
      releaseDate: stored.releaseDate ? new Date(stored.releaseDate) : null,
      status,
    };
  }

  #convertMovieToStoredMovie(movie: Movie): z.infer<typeof StoredMovieSchema> {
    const status =
      movie.status.kind === "released" || movie.status.kind === "unreleased"
        ? {
            kind: movie.status.kind,
            releaseDate: movie.status.releaseDate.toISOString(),
          }
        : movie.status;

    return {
      ...movie,
      releaseDate: movie.releaseDate ? movie.releaseDate.toISOString() : null,
      status,
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

  async addToList(listId: string, movie: Movie): Promise<void> {
    const library = this.#loadLibrary();
    const listIndex = library.lists.findIndex((l) => l.id === listId);

    if (listIndex < 0) {
      throw new Error("List not found");
    }

    // Garantizamos que la pelicula quede guardada en library.movies. Sin
    // esto, la lista guarda una referencia a un id que getById() nunca
    // encuentra, y la lista se ve vacia aunque movieIds no lo este.
    const movieIndex = library.movies.findIndex((m) => m.id === movie.id);
    const storedMovie = this.#convertMovieToStoredMovie(movie);
    if (movieIndex >= 0) {
      library.movies[movieIndex] = storedMovie;
    } else {
      library.movies.push(storedMovie);
    }

    const list = library.lists[listIndex]!;
    if (!list.movieIds.includes(movie.id)) {
      list.movieIds.push(movie.id);
      list.updatedAt = new Date().toISOString();
      library.lists[listIndex] = list;
    }

    this.#saveLibrary(library);
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
