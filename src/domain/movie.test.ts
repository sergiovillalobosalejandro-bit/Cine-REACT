import { describe, it, expect } from "vitest";
import { createMovie } from "./movie.js";

describe("Movie", () => {
  describe("createMovie", () => {
    it("should create a movie with valid data", () => {
      const data = {
        id: 1,
        title: "Test Movie",
        original_title: "Test Movie",
        overview: "A test movie",
        poster_path: "/poster.jpg",
        release_date: "2020-01-01",
        runtime: 120,
        genres: [{ id: 1, name: "Action" }],
        budget: 1000000,
        vote_count: 1000,
        vote_average: 8.0,
      };

      const movie = createMovie(data);

      expect(movie.id).toBe(1);
      expect(movie.title).toBe("Test Movie");
      expect(movie.originalTitle).toBe("Test Movie");
      expect(movie.overview).toBe("A test movie");
      expect(movie.posterPath).toBe("/poster.jpg");
      expect(movie.runtime).toBe(120);
      expect(movie.genres).toEqual([{ id: 1, name: "Action" }]);
      expect(movie.budget).toEqual({ amountMinor: 100000000, currency: "USD" });
    });

    it("should convert null/empty values to null", () => {
      const data = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: null,
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [],
        budget: null,
        vote_count: null,
        vote_average: null,
      };

      const movie = createMovie(data);

      expect(movie.originalTitle).toBeNull();
      expect(movie.overview).toBeNull();
      expect(movie.posterPath).toBeNull();
      expect(movie.releaseDate).toBeNull();
      expect(movie.runtime).toBeNull();
      expect(movie.budget).toBeNull();
    });

    it("should convert empty strings to null", () => {
      const data = {
        id: 1,
        title: "Test Movie",
        original_title: "",
        overview: "",
        poster_path: "",
        release_date: "",
        runtime: 0,
        genres: [],
        budget: 0,
        vote_count: 0,
        vote_average: 0,
      };

      const movie = createMovie(data);

      expect(movie.originalTitle).toBeNull();
      expect(movie.overview).toBeNull();
      expect(movie.posterPath).toBeNull();
      expect(movie.runtime).toBeNull();
      expect(movie.budget).toBeNull();
    });

    it("should filter out null/undefined genres", () => {
      const data = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: null,
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [
          { id: 1, name: "Action" },
          null,
          undefined,
          { id: 2, name: "" },
        ],
        budget: null,
        vote_count: null,
        vote_average: null,
      };

      const movie = createMovie(data);

      expect(movie.genres).toEqual([{ id: 1, name: "Action" }]);
    });

    it("should convert budget to cents", () => {
      const data = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: null,
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [],
        budget: 100,
        vote_count: null,
        vote_average: null,
      };

      const movie = createMovie(data);

      expect(movie.budget).toEqual({ amountMinor: 10000, currency: "USD" });
    });

    it("should create correct status for released movie", () => {
      const data = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: null,
        poster_path: null,
        release_date: "2020-01-01",
        runtime: null,
        genres: [],
        budget: null,
        vote_count: null,
        vote_average: null,
      };

      const movie = createMovie(data);

      expect(movie.status.kind).toBe("released");
    });

    it("should create correct status for unreleased movie", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const data = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: null,
        poster_path: null,
        release_date: futureDate.toISOString(),
        runtime: null,
        genres: [],
        budget: null,
        vote_count: null,
        vote_average: null,
      };

      const movie = createMovie(data);

      expect(movie.status.kind).toBe("unreleased");
    });

    it("should create correct status for unknown release date", () => {
      const data = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: null,
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [],
        budget: null,
        vote_count: null,
        vote_average: null,
      };

      const movie = createMovie(data);

      expect(movie.status.kind).toBe("unknown");
    });

    it("should create correct status for invalid release date", () => {
      const data = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: null,
        poster_path: null,
        release_date: "invalid-date",
        runtime: null,
        genres: [],
        budget: null,
        vote_count: null,
        vote_average: null,
      };

      const movie = createMovie(data);

      expect(movie.status.kind).toBe("unknown");
    });

    it("should set releaseDate when release_date is valid", () => {
      const data = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: null,
        poster_path: null,
        release_date: "2020-01-15",
        runtime: null,
        genres: [],
        budget: null,
        vote_count: null,
        vote_average: null,
      };

      const movie = createMovie(data);

      expect(movie.releaseDate).not.toBeNull();
      expect(movie.releaseDate).toBeInstanceOf(Date);
    });

    it("should create correct rating for no votes", () => {
      const data = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: null,
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [],
        budget: null,
        vote_count: 0,
        vote_average: 0,
      };

      const movie = createMovie(data);

      expect(movie.rating.kind).toBe("no-votes");
    });

    it("should create correct rating for few votes", () => {
      const data = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: null,
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [],
        budget: null,
        vote_count: 50,
        vote_average: 7.5,
      };

      const movie = createMovie(data);

      expect(movie.rating.kind).toBe("few-votes");
    });

    it("should create correct rating for established rating", () => {
      const data = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: null,
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [],
        budget: null,
        vote_count: 100,
        vote_average: 8.0,
      };

      const movie = createMovie(data);

      expect(movie.rating.kind).toBe("established");
    });
  });
});
