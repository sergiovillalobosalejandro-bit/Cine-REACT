import { useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryRepository } from "../lib/services.js";
import {
  createList,
  updateList,
  deleteList,
  addMovieToList,
  removeMovieFromList,
} from "../../application/use-cases/manage-lists.js";
import type { Movie } from "../../domain/movie.js";
import { createMovieStatus } from "../../domain/movie-status.js";
import { createRating } from "../../domain/rating.js";
import type { MovieList } from "../../application/ports/library-repository.js";

export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description?: string | undefined;
    }) => createList(libraryRepository, name, description),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["library-lists"] });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listId,
      name,
      description,
    }: {
      listId: string;
      name: string;
      description?: string | undefined;
    }) => updateList(libraryRepository, listId, name, description),
    onSettled: (_data, _error, { listId }) => {
      queryClient.invalidateQueries({ queryKey: ["library-lists"] });
      queryClient.invalidateQueries({ queryKey: ["library-list", listId] });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listId: string) => deleteList(libraryRepository, listId),
    onSettled: (_data, _error, listId) => {
      queryClient.invalidateQueries({ queryKey: ["library-lists"] });
      queryClient.invalidateQueries({ queryKey: ["library-list", listId] });
    },
  });
}

interface ListMutationContext {
  previousLists: MovieList[] | undefined;
  previousListMovies: Movie[] | undefined;
}

export function useAddMovieToList() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { listId: string; movieId: number },
    ListMutationContext
  >({
    onMutate: async ({ listId, movieId }) => {
      await queryClient.cancelQueries({ queryKey: ["library-lists"] });
      await queryClient.cancelQueries({ queryKey: ["library-list", listId] });
      await queryClient.cancelQueries({ queryKey: ["list-movies"] });
      await queryClient.cancelQueries({ queryKey: ["movie-details", movieId] });

      const previousLists = queryClient.getQueryData<MovieList[]>([
        "library-lists",
      ]);
      const previousListMovies = queryClient.getQueryData<Movie[]>([
        "list-movies",
        listId,
      ]);

      queryClient.setQueryData<MovieList[]>(["library-lists"], (old = []) =>
        old.map((list) =>
          list.id === listId
            ? {
                ...list,
                movieIds: [...list.movieIds, movieId],
                updatedAt: new Date(),
              }
            : list,
        ),
      );

      queryClient.setQueryData<Movie[]>(["list-movies", listId], (old = []) => {
        if (old.some((m) => m.id === movieId)) return old;
        return [
          ...old,
          // Placeholder optimista: la pelicula real llega cuando la query
          // se revalida. Usamos las fabricas del dominio en vez de escribir
          // los estados a mano: Rating no tiene variante "unknown", y el
          // casteo "as Movie" que habia antes ocultaba justamente eso.
          {
            id: movieId,
            title: "",
            originalTitle: null,
            overview: null,
            posterPath: null,
            releaseDate: null,
            runtime: null,
            genres: [],
            budget: null,
            status: createMovieStatus(null),
            rating: createRating(null, null),
          },
        ];
      });

      return { previousLists, previousListMovies };
    },

    onError: (_err, { listId }, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(["library-lists"], context.previousLists);
      }
      if (context?.previousListMovies) {
        queryClient.setQueryData(
          ["list-movies", listId],
          context.previousListMovies,
        );
      }
    },

    onSettled: (_data, _error, { listId, movieId }) => {
      queryClient.invalidateQueries({ queryKey: ["library-lists"] });
      queryClient.invalidateQueries({ queryKey: ["library-list", listId] });
      queryClient.invalidateQueries({ queryKey: ["list-movies"] });
      queryClient.invalidateQueries({ queryKey: ["movie-details", movieId] });
      queryClient.invalidateQueries({ queryKey: ["library-saved-movies"] });
    },

    mutationFn: ({ listId, movieId }: { listId: string; movieId: number }) =>
      addMovieToList(libraryRepository, listId, movieId),
  });
}

export function useRemoveMovieFromList() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { listId: string; movieId: number },
    ListMutationContext
  >({
    onMutate: async ({ listId, movieId }) => {
      await queryClient.cancelQueries({ queryKey: ["library-lists"] });
      await queryClient.cancelQueries({ queryKey: ["library-list", listId] });
      await queryClient.cancelQueries({ queryKey: ["list-movies"] });
      await queryClient.cancelQueries({ queryKey: ["movie-details", movieId] });

      const previousLists = queryClient.getQueryData<MovieList[]>([
        "library-lists",
      ]);
      const previousListMovies = queryClient.getQueryData<Movie[]>([
        "list-movies",
        listId,
      ]);

      queryClient.setQueryData<MovieList[]>(["library-lists"], (old = []) =>
        old.map((list) =>
          list.id === listId
            ? {
                ...list,
                movieIds: list.movieIds.filter((id) => id !== movieId),
                updatedAt: new Date(),
              }
            : list,
        ),
      );

      queryClient.setQueryData<Movie[]>(["list-movies", listId], (old = []) =>
        old.filter((m) => m.id !== movieId),
      );

      return { previousLists, previousListMovies };
    },

    onError: (_err, { listId }, context) => {
      if (context?.previousLists) {
        queryClient.setQueryData(["library-lists"], context.previousLists);
      }
      if (context?.previousListMovies) {
        queryClient.setQueryData(
          ["list-movies", listId],
          context.previousListMovies,
        );
      }
    },

    onSettled: (_data, _error, { listId, movieId }) => {
      queryClient.invalidateQueries({ queryKey: ["library-lists"] });
      queryClient.invalidateQueries({ queryKey: ["library-list", listId] });
      queryClient.invalidateQueries({ queryKey: ["list-movies"] });
      queryClient.invalidateQueries({ queryKey: ["movie-details", movieId] });
      queryClient.invalidateQueries({ queryKey: ["library-saved-movies"] });
    },

    mutationFn: ({ listId, movieId }: { listId: string; movieId: number }) =>
      removeMovieFromList(libraryRepository, listId, movieId),
  });
}
