import { describe, it, expect, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../../test/msw/server.js";
import { TmdbClient, TmdbError } from "./tmdb-client.js";

describe("TmdbClient", () => {
  afterEach(() => {
    server.resetHandlers();
  });

  it("should return data on successful request", async () => {
    const mockData = { test: "data" };

    server.use(
      http.get("https://api.themoviedb.org/test", () => {
        return HttpResponse.json(mockData);
      }),
    );

    const client = new TmdbClient();
    const result = await client.get("/test");

    expect(result).toEqual(mockData);
  });

  it("should throw TmdbError with NOT_FOUND for TMDB code 34", async () => {
    server.use(
      http.get("https://api.themoviedb.org/test", () => {
        return HttpResponse.json(
          {
            status_code: 34,
            status_message: "The resource you requested could not be found.",
          },
          { status: 404 },
        );
      }),
    );

    const client = new TmdbClient();

    await expect(client.get("/test")).rejects.toThrow(TmdbError);
    await expect(client.get("/test")).rejects.toThrow("Recurso no encontrado");

    try {
      await client.get("/test");
    } catch (error) {
      expect(error).toBeInstanceOf(TmdbError);
      if (error instanceof TmdbError) {
        expect(error.code).toBe("NOT_FOUND");
      }
    }
  });

  it("should throw TmdbError with INVALID_PAGE for TMDB code 22", async () => {
    server.use(
      http.get("https://api.themoviedb.org/test", () => {
        return HttpResponse.json(
          {
            status_code: 22,
            status_message: "Invalid page: Pages start at 1 and max at 500.",
          },
          { status: 400 },
        );
      }),
    );

    const client = new TmdbClient();

    await expect(client.get("/test")).rejects.toThrow(TmdbError);
    await expect(client.get("/test")).rejects.toThrow("Página inválida");

    try {
      await client.get("/test");
    } catch (error) {
      expect(error).toBeInstanceOf(TmdbError);
      if (error instanceof TmdbError) {
        expect(error.code).toBe("INVALID_PAGE");
      }
    }
  });

  it("should throw TmdbError with RATE_LIMIT for HTTP 429", async () => {
    server.use(
      http.get("https://api.themoviedb.org/test", () => {
        return HttpResponse.json(
          { status_code: 429, status_message: "Rate limit exceeded" },
          { status: 429, headers: { "Retry-After": "5" } },
        );
      }),
    );

    const client = new TmdbClient();

    await expect(client.get("/test")).rejects.toThrow(TmdbError);
    await expect(client.get("/test")).rejects.toThrow(
      "Límite de peticiones excedido",
    );

    try {
      await client.get("/test");
    } catch (error) {
      expect(error).toBeInstanceOf(TmdbError);
      if (error instanceof TmdbError) {
        expect(error.code).toBe("RATE_LIMIT");
        expect(error.retryAfter).toBe(5);
      }
    }
  });

  it("should throw TmdbError with RATE_LIMIT for HTTP 429 without retry-after", async () => {
    server.use(
      http.get("https://api.themoviedb.org/test", () => {
        return HttpResponse.json(
          { status_code: 429, status_message: "Rate limit exceeded" },
          { status: 429 },
        );
      }),
    );

    const client = new TmdbClient();

    try {
      await client.get("/test");
    } catch (error) {
      expect(error).toBeInstanceOf(TmdbError);
      if (error instanceof TmdbError) {
        expect(error.code).toBe("RATE_LIMIT");
        expect(error.retryAfter).toBeUndefined();
      }
    }
  });

  it("should throw TmdbError with NOT_FOUND for HTTP 404", async () => {
    server.use(
      http.get("https://api.themoviedb.org/test", () => {
        return HttpResponse.json(
          { status_code: 404, status_message: "Not found" },
          { status: 404 },
        );
      }),
    );

    const client = new TmdbClient();

    await expect(client.get("/test")).rejects.toThrow(TmdbError);
    await expect(client.get("/test")).rejects.toThrow("Recurso no encontrado");

    try {
      await client.get("/test");
    } catch (error) {
      expect(error).toBeInstanceOf(TmdbError);
      if (error instanceof TmdbError) {
        expect(error.code).toBe("NOT_FOUND");
      }
    }
  });

  it("should throw TmdbError with NETWORK_ERROR for network errors", async () => {
    server.use(
      http.get("https://api.themoviedb.org/test", () => {
        return HttpResponse.error();
      }),
    );

    const client = new TmdbClient();

    await expect(client.get("/test")).rejects.toThrow(TmdbError);
    await expect(client.get("/test")).rejects.toThrow("Error de red");

    try {
      await client.get("/test");
    } catch (error) {
      expect(error).toBeInstanceOf(TmdbError);
      if (error instanceof TmdbError) {
        expect(error.code).toBe("NETWORK_ERROR");
      }
    }
  });

  it("should pass query parameters", async () => {
    server.use(
      http.get("https://api.themoviedb.org/test", ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("page")).toBe("1");
        expect(url.searchParams.get("query")).toBe("test");
        return HttpResponse.json({ success: true });
      }),
    );

    const client = new TmdbClient();
    await client.get("/test", { page: 1, query: "test" });
  });

  it("should include Bearer token in authorization header", async () => {
    server.use(
      http.get("https://api.themoviedb.org/test", ({ request }) => {
        const auth = request.headers.get("Authorization");
        expect(auth).toMatch(/^Bearer /);
        return HttpResponse.json({ success: true });
      }),
    );

    const client = new TmdbClient();
    await client.get("/test");
  });
});
