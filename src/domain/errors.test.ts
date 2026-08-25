import { describe, it, expect } from "vitest";
import {
  DomainError,
  InvalidMovieDataError,
  InvalidMoneyError,
} from "./errors.js";

describe("Errors", () => {
  describe("DomainError", () => {
    it("should create a DomainError with message", () => {
      const error = new DomainError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.name).toBe("DomainError");
    });

    it("should be an instance of Error", () => {
      const error = new DomainError("Test error");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("InvalidMovieDataError", () => {
    it("should create an InvalidMovieDataError with message", () => {
      const error = new InvalidMovieDataError("Invalid movie data");
      expect(error.message).toBe("Invalid movie data");
      expect(error.name).toBe("InvalidMovieDataError");
    });

    it("should be an instance of DomainError", () => {
      const error = new InvalidMovieDataError("Invalid movie data");
      expect(error).toBeInstanceOf(DomainError);
    });

    it("should be an instance of Error", () => {
      const error = new InvalidMovieDataError("Invalid movie data");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("InvalidMoneyError", () => {
    it("should create an InvalidMoneyError with message", () => {
      const error = new InvalidMoneyError("Invalid money");
      expect(error.message).toBe("Invalid money");
      expect(error.name).toBe("InvalidMoneyError");
    });

    it("should be an instance of DomainError", () => {
      const error = new InvalidMoneyError("Invalid money");
      expect(error).toBeInstanceOf(DomainError);
    });

    it("should be an instance of Error", () => {
      const error = new InvalidMoneyError("Invalid money");
      expect(error).toBeInstanceOf(Error);
    });
  });
});
