import { describe, it, expect } from "vitest";
import { getTrendingMovies } from "./get-trending-movies.js";
import type { Movie } from "../../domain/movie.js";
import type { MovieRepository } from "../ports/movie-repository.js";

describe("getTrendingMovies", () => {
  it("should return trending movies for day", async () => {
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
      getTrending: async () => mockMovies,
      discover: async () => [],
      search: async () => ({ movies: [], totalPages: 0, currentPage: 1 }),
      getDetails: async () => mockMovies[0]!,
      getRecommendations: async () => [],
    };

    const result = await getTrendingMovies(mockRepository, "day");

    expect(result).toEqual(mockMovies);
  });

  it("should return trending movies for week", async () => {
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
      getTrending: async () => mockMovies,
      discover: async () => [],
      search: async () => ({ movies: [], totalPages: 0, currentPage: 1 }),
      getDetails: async () => mockMovies[0]!,
      getRecommendations: async () => [],
    };

    const result = await getTrendingMovies(mockRepository, "week");

    expect(result).toEqual(mockMovies);
  });

  it("should default to day when timeWindow is not provided", async () => {
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
      getTrending: async (timeWindow) => {
        expect(timeWindow).toBe("day");
        return mockMovies;
      },
      discover: async () => [],
      search: async () => ({ movies: [], totalPages: 0, currentPage: 1 }),
      getDetails: async () => mockMovies[0]!,
      getRecommendations: async () => [],
    };

    const result = await getTrendingMovies(mockRepository);

    expect(result).toEqual(mockMovies);
  });
});
