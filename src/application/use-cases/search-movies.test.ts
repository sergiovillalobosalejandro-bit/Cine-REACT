import { describe, it, expect } from "vitest";
import { searchMovies } from "./search-movies.js";
import type { Movie } from "../../domain/movie.js";
import type { MovieRepository } from "../ports/movie-repository.js";

describe("searchMovies", () => {
  it("should return search results for valid query", async () => {
    const mockMovies: Movie[] = [
      {
        id: 1,
        title: "Movie 1",
        originalTitle: null,
        overview: null,
        posterPath: null,
        releaseDate: null,
        runtime: null,
        genres: [],
        budget: null,
        status: { kind: "unknown" },
        rating: { kind: "no-votes" },
      },
    ];

    const mockRepository: MovieRepository = {
      getTrending: async () => [],
      discover: async () => [],
      search: async () => ({
        movies: mockMovies,
        totalPages: 5,
        currentPage: 1,
      }),
      getDetails: async () => mockMovies[0]!,
      getRecommendations: async () => [],
    };

    const result = await searchMovies(mockRepository, "test");

    expect(result.movies).toEqual(mockMovies);
    expect(result.totalPages).toBe(5);
    expect(result.currentPage).toBe(1);
  });

  it("should return empty result for empty query", async () => {
    const mockRepository: MovieRepository = {
      getTrending: async () => [],
      discover: async () => [],
      search: async () => ({ movies: [], totalPages: 0, currentPage: 1 }),
      getDetails: async () => {
        throw new Error("Should not be called");
      },
      getRecommendations: async () => [],
    };

    const result = await searchMovies(mockRepository, "");

    expect(result.movies).toEqual([]);
    expect(result.totalPages).toBe(0);
    expect(result.currentPage).toBe(1);
  });

  it("should return empty result for whitespace query", async () => {
    const mockRepository: MovieRepository = {
      getTrending: async () => [],
      discover: async () => [],
      search: async () => ({ movies: [], totalPages: 0, currentPage: 1 }),
      getDetails: async () => {
        throw new Error("Should not be called");
      },
      getRecommendations: async () => [],
    };

    const result = await searchMovies(mockRepository, "   ");

    expect(result.movies).toEqual([]);
    expect(result.totalPages).toBe(0);
    expect(result.currentPage).toBe(1);
  });

  it("should trim query before searching", async () => {
    const mockMovies: Movie[] = [];

    const mockRepository: MovieRepository = {
      getTrending: async () => [],
      discover: async () => [],
      search: async (query) => {
        expect(query).toBe("test");
        return { movies: mockMovies, totalPages: 0, currentPage: 1 };
      },
      getDetails: async () => mockMovies[0]!,
      getRecommendations: async () => [],
    };

    await searchMovies(mockRepository, "  test  ");
  });

  it("should pass page parameter to repository", async () => {
    const mockMovies: Movie[] = [];

    const mockRepository: MovieRepository = {
      getTrending: async () => [],
      discover: async () => [],
      search: async (_query, page) => {
        expect(page).toBe(2);
        return { movies: mockMovies, totalPages: 0, currentPage: 1 };
      },
      getDetails: async () => mockMovies[0]!,
      getRecommendations: async () => [],
    };

    await searchMovies(mockRepository, "test", 2);
  });
});
