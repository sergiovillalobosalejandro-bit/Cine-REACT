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
    { listId: string; movie: Movie },
    ListMutationContext
  >({
    onMutate: async ({ listId, movie }) => {
      await queryClient.cancelQueries({ queryKey: ["library-lists"] });
      await queryClient.cancelQueries({ queryKey: ["library-list", listId] });
      await queryClient.cancelQueries({ queryKey: ["list-movies"] });
      await queryClient.cancelQueries({
        queryKey: ["movie-details", movie.id],
      });

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
                movieIds: [...list.movieIds, movie.id],
                updatedAt: new Date(),
              }
            : list,
        ),
      );

      // A diferencia de antes, ya tenemos la pelicula completa: la
      // actualizacion optimista usa sus datos reales (titulo, poster...)
      // en vez de un relleno vacio que se veia mal hasta que la query
      // revalidaba.
      queryClient.setQueryData<Movie[]>(["list-movies", listId], (old = []) => {
        if (old.some((m) => m.id === movie.id)) return old;
        return [...old, movie];
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

    onSettled: (_data, _error, { listId, movie }) => {
      queryClient.invalidateQueries({ queryKey: ["library-lists"] });
      queryClient.invalidateQueries({ queryKey: ["library-list", listId] });
      queryClient.invalidateQueries({ queryKey: ["list-movies"] });
      queryClient.invalidateQueries({
        queryKey: ["movie-details", movie.id],
      });
      queryClient.invalidateQueries({ queryKey: ["library-saved-movies"] });
    },

    mutationFn: ({ listId, movie }: { listId: string; movie: Movie }) =>
      addMovieToList(libraryRepository, listId, movie),
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
