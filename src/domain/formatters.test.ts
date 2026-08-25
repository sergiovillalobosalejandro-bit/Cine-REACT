import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatRuntime,
  formatMovieStatus,
  formatGenres,
  formatMovieTitle,
} from "./formatters.js";
import { createMovie } from "./movie.js";

describe("Formatters", () => {
  describe("formatDate", () => {
    it("should format a valid date", () => {
      const date = new Date("2020-01-15T12:00:00Z");
      expect(formatDate(date)).toBe("January 15, 2020");
    });

    it("should return Unknown for null", () => {
      expect(formatDate(null)).toBe("Unknown");
    });

    it("should format with different locale", () => {
      const date = new Date("2020-01-15T12:00:00Z");
      expect(formatDate(date, "de-DE")).toBe("15. Januar 2020");
    });
  });

  describe("formatRuntime", () => {
    it("should format hours and minutes", () => {
      expect(formatRuntime(150)).toBe("2h 30m");
    });

    it("should format only hours", () => {
      expect(formatRuntime(120)).toBe("2h");
    });

    it("should format only minutes", () => {
      expect(formatRuntime(30)).toBe("30m");
    });

    it("should return Unknown for null", () => {
      expect(formatRuntime(null)).toBe("Unknown");
    });

    it("should format with different locale", () => {
      expect(formatRuntime(150, "de-DE")).toBe("2h 30m");
    });
  });

  describe("formatMovieStatus", () => {
    it("should format released status", () => {
      const status = { kind: "released" as const, releaseDate: new Date() };
      expect(formatMovieStatus(status)).toBe("Released");
    });

    it("should format unreleased status", () => {
      const status = { kind: "unreleased" as const, releaseDate: new Date() };
      expect(formatMovieStatus(status)).toBe("Coming Soon");
    });

    it("should format unknown status", () => {
      const status = { kind: "unknown" as const };
      expect(formatMovieStatus(status)).toBe("Unknown");
    });
  });

  describe("formatGenres", () => {
    it("should format single genre", () => {
      const genres = [{ name: "Action" }];
      expect(formatGenres(genres)).toBe("Action");
    });

    it("should format two genres", () => {
      const genres = [{ name: "Action" }, { name: "Comedy" }];
      expect(formatGenres(genres)).toBe("Action & Comedy");
    });

    it("should format multiple genres", () => {
      const genres = [
        { name: "Action" },
        { name: "Comedy" },
        { name: "Drama" },
      ];
      expect(formatGenres(genres)).toBe("Action, Comedy, and Drama");
    });

    it("should return Unknown for empty array", () => {
      expect(formatGenres([])).toBe("Unknown");
    });

    it("should format with different locale", () => {
      const genres = [
        { name: "Action" },
        { name: "Comedy" },
        { name: "Drama" },
      ];
      expect(formatGenres(genres, "de-DE")).toBe("Action, Comedy und Drama");
    });
  });

  describe("formatMovieTitle", () => {
    it("should return title when original title is same", () => {
      const movie = createMovie({
        id: 1,
        title: "Test Movie",
        original_title: "Test Movie",
        overview: null,
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [],
        budget: null,
        vote_count: null,
        vote_average: null,
      });

      expect(formatMovieTitle(movie)).toBe("Test Movie");
    });

    it("should return title with original title when different", () => {
      const movie = createMovie({
        id: 1,
        title: "Test Movie",
        original_title: "Original Title",
        overview: null,
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [],
        budget: null,
        vote_count: null,
        vote_average: null,
      });

      expect(formatMovieTitle(movie)).toBe("Test Movie (Original Title)");
    });

    it("should return title when original title is null", () => {
      const movie = createMovie({
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
      });

      expect(formatMovieTitle(movie)).toBe("Test Movie");
    });
  });
});
