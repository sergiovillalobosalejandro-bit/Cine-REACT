import { describe, it, expect } from "vitest";
import { createMovieStatus } from "./movie-status.js";

describe("MovieStatus", () => {
  describe("createMovieStatus", () => {
    it("should return unknown for null date", () => {
      const status = createMovieStatus(null);
      expect(status).toEqual({ kind: "unknown" });
    });

    it("should return unknown for undefined date", () => {
      const status = createMovieStatus(undefined);
      expect(status).toEqual({ kind: "unknown" });
    });

    it("should return unknown for empty string", () => {
      const status = createMovieStatus("");
      expect(status).toEqual({ kind: "unknown" });
    });

    it("should return unknown for invalid date", () => {
      const status = createMovieStatus("invalid-date");
      expect(status).toEqual({ kind: "unknown" });
    });

    it("should return unreleased for future date", () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const status = createMovieStatus(futureDate.toISOString());
      expect(status.kind).toBe("unreleased");
      expect(status).toHaveProperty("releaseDate");
    });

    it("should return released for past date", () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      const status = createMovieStatus(pastDate.toISOString());
      expect(status.kind).toBe("released");
      expect(status).toHaveProperty("releaseDate");
    });

    it("should return released for today", () => {
      const today = new Date();
      const status = createMovieStatus(today.toISOString());
      expect(status.kind).toBe("released");
    });
  });
});
