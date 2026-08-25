import { describe, it, expect } from "vitest";
import { discoverMovies } from "./discover-movies.js";
import type { Movie } from "../../domain/movie.js";
import type {
  MovieRepository,
  DiscoverParams,
} from "../ports/movie-repository.js";

describe("discoverMovies", () => {
  it("should return discovered movies", async () => {
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
      discover: async () => mockMovies,
      search: async () => ({ movies: [], totalPages: 0, currentPage: 1 }),
      getDetails: async () => mockMovies[0]!,
      getRecommendations: async () => [],
    };

    const params: DiscoverParams = { genre: 28, year: 2020 };
    const result = await discoverMovies(mockRepository, params);

    expect(result).toEqual(mockMovies);
  });

  it("should call repository with provided params", async () => {
    const mockMovies: Movie[] = [];

    const mockRepository: MovieRepository = {
      getTrending: async () => [],
      discover: async (params) => {
        expect(params).toEqual({ genre: 28, year: 2020, sortBy: "popularity" });
        return mockMovies;
      },
      search: async () => ({ movies: [], totalPages: 0, currentPage: 1 }),
      getDetails: async () => mockMovies[0]!,
      getRecommendations: async () => [],
    };

    const params: DiscoverParams = {
      genre: 28,
      year: 2020,
      sortBy: "popularity",
    };
    await discoverMovies(mockRepository, params);
  });
});
