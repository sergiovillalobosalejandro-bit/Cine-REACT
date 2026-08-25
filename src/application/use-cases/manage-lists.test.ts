import { describe, it, expect, vi } from "vitest";
import {
  getAllLists,
  createList,
  updateList,
  addMovieToList,
  removeMovieFromList,
  deleteList,
} from "./manage-lists.js";
import type {
  LibraryRepository,
  MovieList,
} from "../ports/library-repository.js";

describe("manage-lists", () => {
  describe("getAllLists", () => {
    it("should return all lists", async () => {
      const mockLists: MovieList[] = [
        {
          id: "1",
          name: "Favorites",
          description: "My favorites",
          movieIds: [1, 2],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => mockLists,
        createList: async () => mockLists[0]!,
        updateList: async () => mockLists[0]!,
        addToList: async () => {},
        removeFromList: async () => {},
        deleteList: async () => {},
      };

      const result = await getAllLists(mockRepository);

      expect(result).toEqual(mockLists);
    });
  });

  describe("createList", () => {
    it("should create list with valid name", async () => {
      const mockList: MovieList = {
        id: "1",
        name: "Favorites",
        description: "My favorites",
        movieIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCreate = vi.fn().mockResolvedValue(mockList);
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: mockCreate,
        updateList: async () => mockList,
        addToList: async () => {},
        removeFromList: async () => {},
        deleteList: async () => {},
      };

      const result = await createList(
        mockRepository,
        "Favorites",
        "My favorites",
      );

      expect(mockCreate).toHaveBeenCalledWith("Favorites", "My favorites");
      expect(result).toEqual(mockList);
    });

    it("should trim name and description", async () => {
      const mockList: MovieList = {
        id: "1",
        name: "Favorites",
        description: "My favorites",
        movieIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCreate = vi.fn().mockResolvedValue(mockList);
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: mockCreate,
        updateList: async () => mockList,
        addToList: async () => {},
        removeFromList: async () => {},
        deleteList: async () => {},
      };

      await createList(mockRepository, "  Favorites  ", "  My favorites  ");

      expect(mockCreate).toHaveBeenCalledWith("Favorites", "My favorites");
    });

    it("should throw error for empty name", async () => {
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => {
          throw new Error("Should not be called");
        },
        updateList: async () => {
          throw new Error("Should not be called");
        },
        addToList: async () => {},
        removeFromList: async () => {},
        deleteList: async () => {},
      };

      await expect(createList(mockRepository, "")).rejects.toThrow(
        "List name cannot be empty",
      );
    });

    it("should throw error for whitespace name", async () => {
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => {
          throw new Error("Should not be called");
        },
        updateList: async () => {
          throw new Error("Should not be called");
        },
        addToList: async () => {},
        removeFromList: async () => {},
        deleteList: async () => {},
      };

      await expect(createList(mockRepository, "   ")).rejects.toThrow(
        "List name cannot be empty",
      );
    });
  });

  describe("updateList", () => {
    it("should update list with valid data", async () => {
      const mockList: MovieList = {
        id: "list-1",
        name: "New Name",
        description: "New Description",
        movieIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdate = vi.fn().mockResolvedValue(mockList);
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => mockList,
        updateList: mockUpdate,
        addToList: async () => {},
        removeFromList: async () => {},
        deleteList: async () => {},
      };

      const result = await updateList(
        mockRepository,
        "  list-1  ",
        "  New Name  ",
        "  New Description  ",
      );

      expect(mockUpdate).toHaveBeenCalledWith(
        "list-1",
        "New Name",
        "New Description",
      );
      expect(result).toEqual(mockList);
    });

    it("should throw error for empty list ID", async () => {
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updateList: async () => {
          throw new Error("Should not be called");
        },
        addToList: async () => {},
        removeFromList: async () => {},
        deleteList: async () => {},
      };

      await expect(updateList(mockRepository, "", "Name")).rejects.toThrow(
        "List ID cannot be empty",
      );
    });

    it("should throw error for empty name", async () => {
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updateList: async () => {
          throw new Error("Should not be called");
        },
        addToList: async () => {},
        removeFromList: async () => {},
        deleteList: async () => {},
      };

      await expect(updateList(mockRepository, "list-1", "  ")).rejects.toThrow(
        "List name cannot be empty",
      );
    });
  });

  describe("addMovieToList", () => {
    it("should add movie to list", async () => {
      const mockAdd = vi.fn();
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updateList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        addToList: mockAdd,
        removeFromList: async () => {},
        deleteList: async () => {},
      };

      await addMovieToList(mockRepository, "list-1", 1);

      expect(mockAdd).toHaveBeenCalledWith("list-1", 1);
    });

    it("should trim list ID", async () => {
      const mockAdd = vi.fn();
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updateList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        addToList: mockAdd,
        removeFromList: async () => {},
        deleteList: async () => {},
      };

      await addMovieToList(mockRepository, "  list-1  ", 1);

      expect(mockAdd).toHaveBeenCalledWith("list-1", 1);
    });

    it("should throw error for empty list ID", async () => {
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updateList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        addToList: async () => {
          throw new Error("Should not be called");
        },
        removeFromList: async () => {},
        deleteList: async () => {},
      };

      await expect(addMovieToList(mockRepository, "", 1)).rejects.toThrow(
        "List ID cannot be empty",
      );
    });

    it("should throw error for invalid movie ID", async () => {
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updateList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        addToList: async () => {
          throw new Error("Should not be called");
        },
        removeFromList: async () => {},
        deleteList: async () => {},
      };

      await expect(addMovieToList(mockRepository, "list-1", 0)).rejects.toThrow(
        "Invalid movie ID",
      );
    });
  });

  describe("removeMovieFromList", () => {
    it("should remove movie from list", async () => {
      const mockRemove = vi.fn();
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updateList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        addToList: async () => {},
        removeFromList: mockRemove,
        deleteList: async () => {},
      };

      await removeMovieFromList(mockRepository, "list-1", 1);

      expect(mockRemove).toHaveBeenCalledWith("list-1", 1);
    });

    it("should throw error for empty list ID", async () => {
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updateList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        addToList: async () => {},
        removeFromList: async () => {
          throw new Error("Should not be called");
        },
        deleteList: async () => {},
      };

      await expect(removeMovieFromList(mockRepository, "", 1)).rejects.toThrow(
        "List ID cannot be empty",
      );
    });

    it("should throw error for invalid movie ID", async () => {
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updateList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        addToList: async () => {},
        removeFromList: async () => {
          throw new Error("Should not be called");
        },
        deleteList: async () => {},
      };

      await expect(
        removeMovieFromList(mockRepository, "list-1", -1),
      ).rejects.toThrow("Invalid movie ID");
    });
  });

  describe("deleteList", () => {
    it("should delete list", async () => {
      const mockDelete = vi.fn();
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updateList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        addToList: async () => {},
        removeFromList: async () => {},
        deleteList: mockDelete,
      };

      await deleteList(mockRepository, "list-1");

      expect(mockDelete).toHaveBeenCalledWith("list-1");
    });

    it("should trim list ID", async () => {
      const mockDelete = vi.fn();
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updateList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        addToList: async () => {},
        removeFromList: async () => {},
        deleteList: mockDelete,
      };

      await deleteList(mockRepository, "  list-1  ");

      expect(mockDelete).toHaveBeenCalledWith("list-1");
    });

    it("should throw error for empty list ID", async () => {
      const mockRepository: LibraryRepository = {
        getAll: async () => [],
        getById: async () => null,
        save: async () => {},
        remove: async () => {},
        exists: async () => false,
        getLists: async () => [],
        createList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        updateList: async () => ({
          id: "1",
          name: "Test",
          description: null,
          movieIds: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        addToList: async () => {},
        removeFromList: async () => {},
        deleteList: async () => {
          throw new Error("Should not be called");
        },
      };

      await expect(deleteList(mockRepository, "")).rejects.toThrow(
        "List ID cannot be empty",
      );
    });
  });
});
