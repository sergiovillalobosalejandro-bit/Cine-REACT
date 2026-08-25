import { describe, it, expect } from "vitest";
import { getMovieDetails } from "./get-movie-details.js";
import type { Movie } from "../../domain/movie.js";
import type { MovieRepository } from "../ports/movie-repository.js";

describe("getMovieDetails", () => {
  it("should return movie details for valid ID", async () => {
    const mockMovie: Movie = {
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
    };

    const mockRepository: MovieRepository = {
      getTrending: async () => [],
      discover: async () => [],
      search: async () => ({ movies: [], totalPages: 0, currentPage: 1 }),
      getDetails: async () => mockMovie,
      getRecommendations: async () => [],
    };

    const result = await getMovieDetails(mockRepository, 1);

    expect(result).toEqual(mockMovie);
  });

  it("should throw error for invalid movie ID (zero)", async () => {
    const mockRepository: MovieRepository = {
      getTrending: async () => [],
      discover: async () => [],
      search: async () => ({ movies: [], totalPages: 0, currentPage: 1 }),
      getDetails: async () => {
        throw new Error("Should not be called");
      },
      getRecommendations: async () => [],
    };

    await expect(getMovieDetails(mockRepository, 0)).rejects.toThrow(
      "Invalid movie ID",
    );
  });

  it("should throw error for invalid movie ID (negative)", async () => {
    const mockRepository: MovieRepository = {
      getTrending: async () => [],
      discover: async () => [],
      search: async () => ({ movies: [], totalPages: 0, currentPage: 1 }),
      getDetails: async () => {
        throw new Error("Should not be called");
      },
      getRecommendations: async () => [],
    };

    await expect(getMovieDetails(mockRepository, -1)).rejects.toThrow(
      "Invalid movie ID",
    );
  });
});
