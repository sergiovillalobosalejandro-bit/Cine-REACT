import type { Movie } from "../../domain/movie.js";

export interface LibraryRepository {
  getAll(): Promise<Movie[]>;
  getById(movieId: number): Promise<Movie | null>;
  save(movie: Movie): Promise<void>;
  remove(movieId: number): Promise<void>;
  exists(movieId: number): Promise<boolean>;
  getLists(): Promise<MovieList[]>;
  createList(name: string, description?: string): Promise<MovieList>;
  updateList(
    listId: string,
    name: string,
    description?: string,
  ): Promise<MovieList>;
  addToList(listId: string, movieId: number): Promise<void>;
  removeFromList(listId: string, movieId: number): Promise<void>;
  deleteList(listId: string): Promise<void>;
}

export interface MovieList {
  id: string;
  name: string;
  description: string | null;
  movieIds: number[];
  createdAt: Date;
  updatedAt: Date;
}
