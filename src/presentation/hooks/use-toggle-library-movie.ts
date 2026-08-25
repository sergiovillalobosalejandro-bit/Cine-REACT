import { useMutation, useQueryClient } from "@tanstack/react-query";
import { libraryRepository } from "../lib/services.js";
import { toggleLibraryMovie } from "../../application/use-cases/toggle-library-movie.js";
import type { Movie } from "../../domain/movie.js";

interface ToggleContext {
  previousSaved: Movie[] | undefined;
}

export function useToggleLibraryMovie() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Movie, ToggleContext>({
    onMutate: async (movie: Movie) => {
      // 1. Cancel related queries before updating
      await queryClient.cancelQueries({ queryKey: ["library-saved-movies"] });
      await queryClient.cancelQueries({
        queryKey: ["movie-details", movie.id],
      });
      await queryClient.cancelQueries({ queryKey: ["library-lists"] });

      // 2. Snapshot previous saved movies state
      const previousSaved = queryClient.getQueryData<Movie[]>([
        "library-saved-movies",
      ]);

      // 3. Update cache optimistically
      queryClient.setQueryData<Movie[]>(
        ["library-saved-movies"],
        (old = []) => {
          const exists = old.some((m) => m.id === movie.id);
          if (exists) {
            return old.filter((m) => m.id !== movie.id);
          }
          return [...old, movie];
        },
      );

      // Return context for rollback if needed
      return { previousSaved };
    },

    onError: (_err, _movie, context) => {
      // 5. If mutation fails, restore previous state snapshot
      if (context?.previousSaved) {
        queryClient.setQueryData(
          ["library-saved-movies"],
          context.previousSaved,
        );
      }
    },

    onSettled: (_data, _error, movie) => {
      // 6. Invalidate all related queries upon completion
      queryClient.invalidateQueries({ queryKey: ["library-saved-movies"] });
      queryClient.invalidateQueries({ queryKey: ["movie-details", movie.id] });
      queryClient.invalidateQueries({ queryKey: ["library-lists"] });
      queryClient.invalidateQueries({ queryKey: ["list-movies"] });
    },

    mutationFn: (movie: Movie) => toggleLibraryMovie(libraryRepository, movie),
  });
}
