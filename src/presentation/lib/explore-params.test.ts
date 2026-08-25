import { describe, it, expect } from "vitest";
import {
  parseExploreParams,
  normalizeExploreParams,
  buildSearchParams,
  hasActiveFilters,
  DEFAULT_EXPLORE_PARAMS,
} from "./explore-params.js";

describe("explore-params", () => {
  describe("parseExploreParams", () => {
    it("should return default params when searchParams is empty", () => {
      const searchParams = new URLSearchParams("");
      const result = parseExploreParams(searchParams);
      expect(result).toEqual(DEFAULT_EXPLORE_PARAMS);
    });

    it("should parse valid searchParams correctly", () => {
      const searchParams = new URLSearchParams(
        "genre=28&year=2022&voteAverageMin=7&voteCountMin=100&sortBy=vote_average",
      );
      const result = parseExploreParams(searchParams);
      expect(result).toEqual({
        genre: 28,
        year: 2022,
        voteAverageMin: 7,
        voteCountMin: 100,
        sortBy: "vote_average",
      });
    });

    it("should fallback gracefully to defaults when params are corrupt or invalid", () => {
      const searchParams = new URLSearchParams(
        "genre=invalid&year=99999&voteAverageMin=999&sortBy=not_a_sort",
      );
      const result = parseExploreParams(searchParams);
      expect(result).toEqual(DEFAULT_EXPLORE_PARAMS);
    });
  });

  describe("normalizeExploreParams", () => {
    it("should return empty object for default params", () => {
      const result = normalizeExploreParams(DEFAULT_EXPLORE_PARAMS);
      expect(result).toEqual({});
    });

    it("should include defined non-default fields", () => {
      const result = normalizeExploreParams({
        genre: 28,
        year: 2020,
        voteAverageMin: 8,
        sortBy: "vote_count",
      });
      expect(result).toEqual({
        genre: 28,
        year: 2020,
        voteAverageMin: 8,
        sortBy: "vote_count",
      });
    });
  });

  describe("buildSearchParams", () => {
    it("should build URLSearchParams matching non-default parameters", () => {
      const params = {
        genre: 28,
        year: 2021,
        voteAverageMin: 7,
        voteCountMin: 500,
        sortBy: "vote_average" as const,
      };
      const searchParams = buildSearchParams(params);
      expect(searchParams.get("genre")).toBe("28");
      expect(searchParams.get("year")).toBe("2021");
      expect(searchParams.get("voteAverageMin")).toBe("7");
      expect(searchParams.get("voteCountMin")).toBe("500");
      expect(searchParams.get("sortBy")).toBe("vote_average");
    });
  });

  describe("hasActiveFilters", () => {
    it("should return false for default params", () => {
      expect(hasActiveFilters(DEFAULT_EXPLORE_PARAMS)).toBe(false);
    });

    it("should return true when any filter is non-default", () => {
      expect(hasActiveFilters({ genre: 28, sortBy: "popularity" })).toBe(true);
      expect(hasActiveFilters({ sortBy: "vote_average" })).toBe(true);
    });
  });
});
