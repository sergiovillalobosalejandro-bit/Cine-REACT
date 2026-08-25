import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useToggleLibraryMovie } from "./use-toggle-library-movie.js";
import { libraryRepository } from "../lib/services.js";
import type { Movie } from "../../domain/movie.js";
import type { ReactNode } from "react";

const mockMovie: Movie = {
  id: 1,
  title: "Test Movie",
  originalTitle: null,
  overview: null,
  posterPath: null,
  releaseDate: null,
  runtime: null,
  genres: [],
  budget: null,
  status: { kind: "unknown" },
  rating: { kind: "no-votes" },
};

describe("useToggleLibraryMovie", () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    globalThis.localStorage.clear();
  });

  it("should optimistically add movie to saved movies cache", async () => {
    queryClient.setQueryData(["library-saved-movies"], []);

    const { result } = renderHook(() => useToggleLibraryMovie(), { wrapper });

    act(() => {
      result.current.mutate(mockMovie);
    });

    // Wait for optimistic update (onMutate is async)
    await waitFor(() => {
      const optimisticData = queryClient.getQueryData<Movie[]>([
        "library-saved-movies",
      ]);
      expect(optimisticData).toHaveLength(1);
      expect(optimisticData![0]!.id).toBe(1);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("should rollback optimistic cache on error", async () => {
    const initialSaved = [mockMovie];
    queryClient.setQueryData(["library-saved-movies"], initialSaved);

    // Mock exists to return true (so it tries to remove) and remove to throw error
    vi.spyOn(libraryRepository, "exists").mockResolvedValueOnce(true);
    vi.spyOn(libraryRepository, "remove").mockRejectedValueOnce(
      new Error("Storage Write Failed"),
    );

    const { result } = renderHook(() => useToggleLibraryMovie(), { wrapper });

    await act(async () => {
      result.current.mutate(mockMovie);
      // Wait for mutation to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Verify cache was rolled back to initial state
    const rolledBackData = queryClient.getQueryData<Movie[]>([
      "library-saved-movies",
    ]);
    expect(rolledBackData).toEqual(initialSaved);
  });
});
