import { describe, it, expect } from "vitest";
import { LocalLibraryRepository } from "./local-library-repository.js";
import type { Movie } from "../../domain/movie.js";

const mockMovie: Movie = {
  id: 1,
  title: "Test Movie",
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

const mockMovie2: Movie = { ...mockMovie, id: 2, title: "Test Movie 2" };

describe("LocalLibraryRepository", () => {
  const createFreshRepository = () => {
    globalThis.localStorage.clear();
    return new LocalLibraryRepository();
  };

  describe("getAll", () => {
    it("should return empty array when no library stored", async () => {
      const repository = createFreshRepository();
      const result = await repository.getAll();
      expect(result).toEqual([]);
    });

    it("should return stored movies", async () => {
      const repository = createFreshRepository();
      await repository.save(mockMovie);
      const result = await repository.getAll();
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe(1);
    });

    it("should handle corrupted localStorage data - invalid JSON", async () => {
      const repository = createFreshRepository();
      globalThis.localStorage.setItem("cineteca-library-v1", "invalid json");
      const result = await repository.getAll();
      expect(result).toEqual([]);
    });

    it("should handle corrupted localStorage data - invalid schema", async () => {
      const repository = createFreshRepository();
      globalThis.localStorage.setItem(
        "cineteca-library-v1",
        JSON.stringify({ invalid: "data" }),
      );
      const result = await repository.getAll();
      expect(result).toEqual([]);
    });

    it("should handle corrupted localStorage data - partial data", async () => {
      const repository = createFreshRepository();
      globalThis.localStorage.setItem(
        "cineteca-library-v1",
        JSON.stringify({ movies: [{ id: "not a number" }], lists: [] }),
      );
      const result = await repository.getAll();
      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return null when movie not found", async () => {
      const repository = createFreshRepository();
      const result = await repository.getById(999);
      expect(result).toBeNull();
    });

    it("should return movie when found", async () => {
      const repository = createFreshRepository();
      await repository.save(mockMovie);
      const result = await repository.getById(1);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
    });
  });

  describe("save", () => {
    it("should save new movie", async () => {
      const repository = createFreshRepository();
      await repository.save(mockMovie);
      const result = await repository.getById(1);
      expect(result).not.toBeNull();
    });

    it("should update existing movie", async () => {
      const repository = createFreshRepository();
      await repository.save(mockMovie);

      const updatedMovie: Movie = {
        ...mockMovie,
        title: "Updated Title",
      };

      await repository.save(updatedMovie);

      const result = await repository.getById(1);
      expect(result!.title).toBe("Updated Title");
      expect(await repository.getAll()).toHaveLength(1);
    });
  });

  describe("remove", () => {
    it("should remove movie", async () => {
      const repository = createFreshRepository();
      await repository.save(mockMovie);
      await repository.remove(1);
      const result = await repository.getById(1);
      expect(result).toBeNull();
    });

    it("should not throw when removing non-existent movie", async () => {
      const repository = createFreshRepository();
      await expect(repository.remove(999)).resolves.not.toThrow();
    });
  });

  describe("exists", () => {
    it("should return false when movie does not exist", async () => {
      const repository = createFreshRepository();
      const result = await repository.exists(999);
      expect(result).toBe(false);
    });

    it("should return true when movie exists", async () => {
      const repository = createFreshRepository();
      await repository.save(mockMovie);
      const result = await repository.exists(1);
      expect(result).toBe(true);
    });
  });

  describe("getLists", () => {
    it("should return empty array when no lists stored", async () => {
      const repository = createFreshRepository();
      const result = await repository.getLists();
      expect(result).toEqual([]);
    });

    it("should return stored lists", async () => {
      const repository = createFreshRepository();
      await repository.createList("Test List");
      const result = await repository.getLists();
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe("Test List");
    });

    it("should include updatedAt in stored lists", async () => {
      const repository = createFreshRepository();
      await repository.createList("Test List");
      const lists = await repository.getLists();
      expect(lists[0]!.id).toBeDefined();
    });
  });

  describe("createList", () => {
    it("should create new list", async () => {
      const repository = createFreshRepository();
      const result = await repository.createList(
        "Favorites",
        "My favorite movies",
      );
      expect(result.name).toBe("Favorites");
      expect(result.description).toBe("My favorite movies");
      expect(result.movieIds).toEqual([]);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should create list with null description when not provided", async () => {
      const repository = createFreshRepository();
      const result = await repository.createList("Favorites");
      expect(result.description).toBeNull();
    });

    it("should persist list in single storage key", async () => {
      const repository = createFreshRepository();
      await repository.createList("Favorites");
      const stored = JSON.parse(
        globalThis.localStorage.getItem("cineteca-library-v1")!,
      );
      expect(stored.lists).toHaveLength(1);
      expect(stored.movies).toEqual([]);
    });
  });

  describe("addToList", () => {
    it("should add movie to list", async () => {
      const repository = createFreshRepository();
      const list = await repository.createList("Favorites");
      await repository.addToList(list.id, mockMovie);

      const updatedList = (await repository.getLists())[0]!;
      expect(updatedList.movieIds).toContain(1);
    });

    it("should update updatedAt when adding movie", async () => {
      const repository = createFreshRepository();
      const list = await repository.createList("Favorites");
      await repository.addToList(list.id, mockMovie);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await repository.addToList(list.id, mockMovie2);
      const stored = JSON.parse(
        globalThis.localStorage.getItem("cineteca-library-v1")!,
      );
      const updatedAt = new Date(stored.lists[0]!.updatedAt);
      expect(updatedAt).toBeDefined();
    });

    it("should not add duplicate movie to list", async () => {
      const repository = createFreshRepository();
      const list = await repository.createList("Favorites");
      await repository.addToList(list.id, mockMovie);
      const afterFirst = (await repository.getLists())[0]!;
      expect(afterFirst.movieIds).toHaveLength(1);
      await repository.addToList(list.id, mockMovie);
      const afterSecond = (await repository.getLists())[0]!;
      expect(afterSecond.movieIds).toHaveLength(1);
    });

    it("should throw error when list not found", async () => {
      const repository = createFreshRepository();
      await expect(
        repository.addToList("non-existent", mockMovie),
      ).rejects.toThrow("List not found");
    });
  });

  describe("removeFromList", () => {
    it("should remove movie from list", async () => {
      const repository = createFreshRepository();
      const list = await repository.createList("Favorites");
      await repository.addToList(list.id, mockMovie);
      await repository.removeFromList(list.id, 1);

      const updatedList = (await repository.getLists())[0]!;
      expect(updatedList.movieIds).not.toContain(1);
    });

    it("should update updatedAt when removing movie", async () => {
      const repository = createFreshRepository();
      const list = await repository.createList("Favorites");
      await repository.addToList(list.id, mockMovie);
      await repository.addToList(list.id, mockMovie2);
      await repository.removeFromList(list.id, 1);
      const stored = JSON.parse(
        globalThis.localStorage.getItem("cineteca-library-v1")!,
      );
      const updatedAt = new Date(stored.lists[0]!.updatedAt);
      expect(updatedAt).toBeDefined();
    });

    it("should throw error when list not found", async () => {
      const repository = createFreshRepository();
      await expect(
        repository.removeFromList("non-existent", 1),
      ).rejects.toThrow("List not found");
    });
  });

  describe("deleteList", () => {
    it("should delete list", async () => {
      const repository = createFreshRepository();
      const list = await repository.createList("Favorites");
      await repository.deleteList(list.id);

      const lists = await repository.getLists();
      expect(lists).toHaveLength(0);
    });

    it("should not throw when deleting non-existent list", async () => {
      const repository = createFreshRepository();
      await expect(
        repository.deleteList("non-existent"),
      ).resolves.not.toThrow();
    });
  });

  describe("updateList", () => {
    it("should update list name and description", async () => {
      const repository = createFreshRepository();
      const list = await repository.createList("Old Name", "Old Description");
      const updated = await repository.updateList(
        list.id,
        "New Name",
        "New Description",
      );

      expect(updated.name).toBe("New Name");
      expect(updated.description).toBe("New Description");
      expect(updated.updatedAt).toBeInstanceOf(Date);

      const storedLists = await repository.getLists();
      expect(storedLists[0]!.name).toBe("New Name");
      expect(storedLists[0]!.description).toBe("New Description");
    });

    it("should set null description if omitted or empty", async () => {
      const repository = createFreshRepository();
      const list = await repository.createList("Old Name", "Old Description");
      const updated = await repository.updateList(list.id, "New Name");

      expect(updated.description).toBeNull();
    });

    it("should throw error when updating non-existent list", async () => {
      const repository = createFreshRepository();
      await expect(
        repository.updateList("non-existent", "New Name"),
      ).rejects.toThrow("List not found");
    });
  });

  describe("single storage key", () => {
    it("should preserve data across operations", async () => {
      const repository = createFreshRepository();
      await repository.save(mockMovie);
      await repository.createList("Favorites");
      await repository.addToList(
        (await repository.getLists())[0]!.id,
        mockMovie,
      );

      const stored = JSON.parse(
        globalThis.localStorage.getItem("cineteca-library-v1")!,
      );
      expect(stored.movies).toHaveLength(1);
      expect(stored.lists).toHaveLength(1);
      expect(stored.lists[0]!.movieIds).toContain(1);
    });
  });
});
