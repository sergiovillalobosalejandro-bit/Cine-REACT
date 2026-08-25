import { describe, it, expect, vi } from "vitest";
import { toggleLibraryMovie } from "./toggle-library-movie.js";
import type { Movie } from "../../domain/movie.js";
import type { LibraryRepository } from "../ports/library-repository.js";

describe("toggleLibraryMovie", () => {
  it("should save movie when it does not exist in library", async () => {
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

    const mockSave = vi.fn();
    const mockRepository: LibraryRepository = {
      getAll: async () => [],
      getById: async () => null,
      save: mockSave,
      remove: async () => {},
      exists: async () => false,
      getLists: async () => [],
      createList: async () => ({
        id: "1",
        name: "Test",
        description: null,
        movieIds: [],
        createdAt: new Date(),
      }),
      addToList: async () => {},
      removeFromList: async () => {},
      deleteList: async () => {},
    };

    await toggleLibraryMovie(mockRepository, mockMovie);

    expect(mockSave).toHaveBeenCalledWith(mockMovie);
  });

  it("should remove movie when it exists in library", async () => {
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

    const mockRemove = vi.fn();
    const mockRepository: LibraryRepository = {
      getAll: async () => [],
      getById: async () => null,
      save: async () => {},
      remove: mockRemove,
      exists: async () => true,
      getLists: async () => [],
      createList: async () => ({
        id: "1",
        name: "Test",
        description: null,
        movieIds: [],
        createdAt: new Date(),
      }),
      addToList: async () => {},
      removeFromList: async () => {},
      deleteList: async () => {},
    };

    await toggleLibraryMovie(mockRepository, mockMovie);

    expect(mockRemove).toHaveBeenCalledWith(mockMovie.id);
  });
});
