import { describe, it, expect } from "vitest";
import { createRating, formatRating } from "./rating.js";

describe("Rating", () => {
  describe("createRating", () => {
    it("should return no-votes for zero count", () => {
      const rating = createRating(0, 0);
      expect(rating).toEqual({ kind: "no-votes" });
    });

    it("should return no-votes for null count", () => {
      const rating = createRating(null, null);
      expect(rating).toEqual({ kind: "no-votes" });
    });

    it("should return no-votes for undefined count", () => {
      const rating = createRating(undefined, undefined);
      expect(rating).toEqual({ kind: "no-votes" });
    });

    it("should return few-votes for count less than 100", () => {
      const rating = createRating(50, 7.5);
      if (rating.kind === "few-votes") {
        expect(rating.voteCount).toBe(50);
        expect(rating.average).toBe(7.5);
      }
    });

    it("should return established for count 100 or more", () => {
      const rating = createRating(100, 8.0);
      if (rating.kind === "established") {
        expect(rating.voteCount).toBe(100);
        expect(rating.average).toBe(8.0);
      }
    });

    it("should return established for count greater than 100", () => {
      const rating = createRating(1000, 9.0);
      if (rating.kind === "established") {
        expect(rating.voteCount).toBe(1000);
        expect(rating.average).toBe(9.0);
      }
    });

    it("should use default average when null", () => {
      const rating = createRating(50, null);
      if (rating.kind === "few-votes") {
        expect(rating.average).toBe(0);
      }
    });
  });

  describe("formatRating", () => {
    it("should format no-votes", () => {
      const rating = createRating(0, 0);
      expect(formatRating(rating)).toBe("No votes");
    });

    it("should format few-votes", () => {
      const rating = createRating(50, 7.5);
      expect(formatRating(rating)).toBe("7.5");
    });

    it("should format established", () => {
      const rating = createRating(100, 8.0);
      expect(formatRating(rating)).toBe("8.0");
    });

    it("should format with different locale", () => {
      const rating = createRating(50, 7.5);
      expect(formatRating(rating, "de-DE")).toBe("7,5");
    });
  });
});
