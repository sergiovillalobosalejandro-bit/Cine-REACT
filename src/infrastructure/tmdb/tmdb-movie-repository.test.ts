import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../test/msw/server.js";
import { TmdbClient } from "../http/tmdb-client.js";
import { TmdbMovieRepository } from "./tmdb-movie-repository.js";

describe("TmdbMovieRepository", () => {
  let client: TmdbClient;
  let repository: TmdbMovieRepository;

  beforeEach(() => {
    client = new TmdbClient();
    repository = new TmdbMovieRepository(client);
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe("getTrending", () => {
    it("should return trending movies for day", async () => {
      const mockResponse = {
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [
          {
            id: 1,
            title: "Test Movie",
            original_title: null,
            overview: "Test overview",
            poster_path: "/path.jpg",
            release_date: "2020-01-15",
            runtime: 120,
            genres: [{ id: 1, name: "Action" }],
            budget: 1000000,
            vote_count: 1000,
            vote_average: 8.5,
          },
        ],
      };

      server.use(
        http.get("https://api.themoviedb.org/trending/movie/day", () => {
          return HttpResponse.json(mockResponse);
        }),
      );

      const result = await repository.getTrending("day");

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe(1);
      expect(result[0]!.title).toBe("Test Movie");
    });

    it("should return trending movies for week", async () => {
      const mockResponse = {
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [
          {
            id: 1,
            title: "Test Movie",
            original_title: null,
            overview: null,
            poster_path: null,
            release_date: null,
            runtime: null,
            genres: [],
            budget: 0,
            vote_count: 0,
            vote_average: 0,
          },
        ],
      };

      server.use(
        http.get("https://api.themoviedb.org/trending/movie/week", () => {
          return HttpResponse.json(mockResponse);
        }),
      );

      const result = await repository.getTrending("week");

      expect(result).toHaveLength(1);
    });

    it("should throw error for corrupt response", async () => {
      server.use(
        http.get("https://api.themoviedb.org/trending/movie/day", () => {
          return HttpResponse.json({ invalid: "data" });
        }),
      );

      await expect(repository.getTrending("day")).rejects.toThrow(
        "Invalid TMDB trending response",
      );
    });
  });

  describe("discover", () => {
    it("should return discovered movies", async () => {
      const mockResponse = {
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [
          {
            id: 1,
            title: "Test Movie",
            original_title: null,
            overview: null,
            poster_path: null,
            release_date: null,
            runtime: null,
            genres: [],
            budget: 0,
            vote_count: 0,
            vote_average: 0,
          },
        ],
      };

      server.use(
        http.get("https://api.themoviedb.org/discover/movie", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("with_genres")).toBe("28");
          expect(url.searchParams.get("primary_release_year")).toBe("2020");
          expect(url.searchParams.get("sort_by")).toBe("popularity.desc");
          return HttpResponse.json(mockResponse);
        }),
      );

      const result = await repository.discover({
        genre: 28,
        year: 2020,
        sortBy: "popularity",
      });

      expect(result).toHaveLength(1);
    });

    it("should throw error for corrupt response", async () => {
      server.use(
        http.get("https://api.themoviedb.org/discover/movie", () => {
          return HttpResponse.json({ invalid: "data" });
        }),
      );

      await expect(repository.discover({})).rejects.toThrow(
        "Invalid TMDB discover response",
      );
    });
  });

  describe("search", () => {
    it("should return search results", async () => {
      const mockResponse = {
        page: 1,
        total_pages: 5,
        total_results: 100,
        results: [
          {
            id: 1,
            title: "Test Movie",
            original_title: null,
            overview: null,
            poster_path: null,
            release_date: null,
            runtime: null,
            genres: [],
            budget: 0,
            vote_count: 0,
            vote_average: 0,
          },
        ],
      };

      server.use(
        http.get("https://api.themoviedb.org/search/movie", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("query")).toBe("test");
          expect(url.searchParams.get("page")).toBe("1");
          return HttpResponse.json(mockResponse);
        }),
      );

      const result = await repository.search("test", 1);

      expect(result.movies).toHaveLength(1);
      expect(result.totalPages).toBe(5);
      expect(result.currentPage).toBe(1);
    });

    it("should limit page to 500", async () => {
      const mockResponse = {
        page: 600,
        total_pages: 600,
        total_results: 12000,
        results: [],
      };

      server.use(
        http.get("https://api.themoviedb.org/search/movie", () => {
          return HttpResponse.json(mockResponse);
        }),
      );

      const result = await repository.search("test", 600);

      expect(result.currentPage).toBe(500);
      expect(result.totalPages).toBe(500);
    });

    it("should throw error for corrupt response", async () => {
      server.use(
        http.get("https://api.themoviedb.org/search/movie", () => {
          return HttpResponse.json({ invalid: "data" });
        }),
      );

      await expect(repository.search("test")).rejects.toThrow(
        "Invalid TMDB search response",
      );
    });
  });

  describe("getDetails", () => {
    it("should return movie details", async () => {
      const mockResponse = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: null,
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [],
        budget: 0,
        vote_count: 0,
        vote_average: 0,
      };

      server.use(
        http.get("https://api.themoviedb.org/movie/1", ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get("append_to_response")).toBe(
            "credits,videos",
          );
          return HttpResponse.json(mockResponse);
        }),
      );

      const result = await repository.getDetails(1);

      expect(result.id).toBe(1);
      expect(result.title).toBe("Test Movie");
    });

    it("should fallback to English overview when Spanish overview is missing", async () => {
      const mockEsResponse = {
        id: 1,
        title: "Test Movie",
        original_title: "Test Movie",
        overview: "",
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [],
        budget: 0,
        vote_count: 0,
        vote_average: 0,
      };

      const mockEnResponse = {
        id: 1,
        title: "Test Movie",
        original_title: "Test Movie",
        overview: "English overview content",
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [],
        budget: 0,
        vote_count: 0,
        vote_average: 0,
      };

      server.use(
        http.get("https://api.themoviedb.org/movie/1", ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get("language") === "es-ES") {
            return HttpResponse.json(mockEsResponse);
          }
          if (url.searchParams.get("language") === "en-US") {
            return HttpResponse.json(mockEnResponse);
          }
          return HttpResponse.json(mockEsResponse);
        }),
      );

      const result = await repository.getDetails(1);

      expect(result.overview).toBe("English overview content");
      expect(result.overviewLanguage).toBe("en");
    });

    it("should parse director, cast, and trailerKey when credits and videos are present", async () => {
      const mockResponse = {
        id: 1,
        title: "Test Movie",
        original_title: null,
        overview: "Movie overview",
        poster_path: null,
        release_date: null,
        runtime: null,
        genres: [],
        budget: 0,
        vote_count: 0,
        vote_average: 0,
        credits: {
          cast: [
            {
              id: 10,
              name: "Actor One",
              character: "Hero",
              profile_path: "/actor1.jpg",
            },
          ],
          crew: [{ id: 20, name: "Director Name", job: "Director" }],
        },
        videos: {
          results: [
            {
              id: "vid1",
              key: "youtubeKey123",
              name: "Trailer",
              site: "YouTube",
              type: "Trailer",
            },
          ],
        },
      };

      server.use(
        http.get("https://api.themoviedb.org/movie/1", () => {
          return HttpResponse.json(mockResponse);
        }),
      );

      const result = await repository.getDetails(1);

      expect(result.director).toBe("Director Name");
      expect(result.cast).toHaveLength(1);
      expect(result.cast![0]!.name).toBe("Actor One");
      expect(result.trailerKey).toBe("youtubeKey123");
    });

    it("should throw error for corrupt response", async () => {
      server.use(
        http.get("https://api.themoviedb.org/movie/1", () => {
          return HttpResponse.json({ invalid: "data" });
        }),
      );

      await expect(repository.getDetails(1)).rejects.toThrow(
        "Invalid TMDB movie details response",
      );
    });
  });

  describe("getRecommendations", () => {
    it("should return recommendations", async () => {
      const mockResponse = {
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [
          {
            id: 2,
            title: "Recommended Movie",
            original_title: null,
            overview: null,
            poster_path: null,
            release_date: null,
            runtime: null,
            genres: [],
            budget: 0,
            vote_count: 0,
            vote_average: 0,
          },
        ],
      };

      server.use(
        http.get("https://api.themoviedb.org/movie/1/recommendations", () => {
          return HttpResponse.json(mockResponse);
        }),
      );

      const result = await repository.getRecommendations(1);

      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe(2);
    });

    it("should throw error for corrupt response", async () => {
      server.use(
        http.get("https://api.themoviedb.org/movie/1/recommendations", () => {
          return HttpResponse.json({ invalid: "data" });
        }),
      );

      await expect(repository.getRecommendations(1)).rejects.toThrow(
        "Invalid TMDB recommendations response",
      );
    });
  });

  describe("error handling", () => {
    it("should propagate 404 errors", async () => {
      server.use(
        http.get("https://api.themoviedb.org/movie/1", () => {
          return HttpResponse.json(
            { status_code: 34, status_message: "Not found" },
            { status: 404 },
          );
        }),
      );

      await expect(repository.getDetails(1)).rejects.toThrow(
        "Recurso no encontrado",
      );
    });

    it("should propagate 429 errors", async () => {
      server.use(
        http.get("https://api.themoviedb.org/movie/1", () => {
          return HttpResponse.json(
            { status_code: 429, status_message: "Rate limit" },
            { status: 429, headers: { "Retry-After": "5" } },
          );
        }),
      );

      await expect(repository.getDetails(1)).rejects.toThrow(
        "Límite de peticiones excedido",
      );
    });

    it("should propagate network errors", async () => {
      server.use(
        http.get("https://api.themoviedb.org/movie/1", () => {
          return HttpResponse.error();
        }),
      );

      await expect(repository.getDetails(1)).rejects.toThrow("Error de red");
    });
  });
});
