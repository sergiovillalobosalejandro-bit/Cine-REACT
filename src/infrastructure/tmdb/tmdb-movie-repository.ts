import { z } from "zod";
import { TmdbClient } from "../http/tmdb-client.js";
import {
  TmdbPaginatedResponseSchema,
  TmdbMovieDetailsSchema,
  TmdbMovieSchema,
} from "./tmdb-schemas.js";
import { createMovie } from "../../domain/movie.js";
import type {
  MovieRepository,
  DiscoverParams,
  SearchResult,
} from "../../application/ports/movie-repository.js";

type TmdbMovie = z.infer<typeof TmdbMovieSchema>;

const MAX_PAGE = 500;

export class TmdbMovieRepository implements MovieRepository {
  #client: TmdbClient;

  constructor(client: TmdbClient) {
    this.#client = client;
  }

  async getTrending(
    timeWindow: "day" | "week",
  ): Promise<import("../../domain/movie.js").Movie[]> {
    const endpoint = `/trending/movie/${timeWindow}`;
    const response = await this.#client.get(endpoint);

    const parsed = TmdbPaginatedResponseSchema.safeParse(response);
    if (!parsed.success) {
      throw new Error(
        `Invalid TMDB trending response: ${parsed.error.message}`,
      );
    }

    return parsed.data.results.map((movie) => this.#transformToDomain(movie));
  }

  async discover(
    params: DiscoverParams,
  ): Promise<import("../../domain/movie.js").Movie[]> {
    const queryParams: Record<string, unknown> = {
      page: params.page ?? 1,
    };

    if (params.genre !== undefined) {
      queryParams.with_genres = params.genre;
    }

    if (params.year !== undefined) {
      queryParams.primary_release_year = params.year;
    }

    if (params.voteAverageMin !== undefined) {
      queryParams["vote_average.gte"] = params.voteAverageMin;
    }

    if (params.voteCountMin !== undefined) {
      queryParams["vote_count.gte"] = params.voteCountMin;
    }

    if (params.sortBy !== undefined) {
      const sortMap = {
        popularity: "popularity.desc",
        vote_average: "vote_average.desc",
        vote_count: "vote_count.desc",
        release_date: "release_date.desc",
      } as const;
      queryParams.sort_by = sortMap[params.sortBy];
    }

    const response = await this.#client.get("/discover/movie", queryParams);

    const parsed = TmdbPaginatedResponseSchema.safeParse(response);
    if (!parsed.success) {
      throw new Error(
        `Invalid TMDB discover response: ${parsed.error.message}`,
      );
    }

    return parsed.data.results.map((movie) => this.#transformToDomain(movie));
  }

  async search(
    query: string,
    page = 1,
    options?: { signal?: AbortSignal },
  ): Promise<SearchResult> {
    const response = await this.#client.get(
      "/search/movie",
      {
        query,
        page,
        language: "es-ES",
      },
      options,
    );

    const parsed = TmdbPaginatedResponseSchema.safeParse(response);
    if (!parsed.success) {
      throw new Error(`Invalid TMDB search response: ${parsed.error.message}`);
    }

    const limitedPage = Math.min(parsed.data.page, MAX_PAGE);
    const limitedTotalPages = Math.min(parsed.data.total_pages, MAX_PAGE);

    return {
      movies: parsed.data.results.map((movie) =>
        this.#transformToDomain(movie),
      ),
      totalPages: limitedTotalPages,
      currentPage: limitedPage,
    };
  }

  async getDetails(
    movieId: number,
    options?: { signal?: AbortSignal },
  ): Promise<import("../../domain/movie.js").Movie> {
    const response = await this.#client.get(
      `/movie/${movieId}`,
      {
        append_to_response: "credits,videos",
        language: "es-ES",
      },
      options,
    );

    const parsed = TmdbMovieDetailsSchema.safeParse(response);
    if (!parsed.success) {
      throw new Error(
        `Invalid TMDB movie details response: ${parsed.error.message}`,
      );
    }

    let detailData = parsed.data;
    let overviewLanguage: "es" | "en" | undefined = undefined;

    if (!detailData.overview || detailData.overview.trim() === "") {
      try {
        const enResponse = await this.#client.get(
          `/movie/${movieId}`,
          {
            append_to_response: "credits,videos",
            language: "en-US",
          },
          options,
        );
        const enParsed = TmdbMovieDetailsSchema.safeParse(enResponse);
        if (
          enParsed.success &&
          enParsed.data.overview &&
          enParsed.data.overview.trim() !== ""
        ) {
          detailData = {
            ...detailData,
            overview: enParsed.data.overview,
          };
          overviewLanguage = "en";
        }
      } catch {
        // Fallback fetch failed, proceed with original detailData
      }
    }

    return this.#transformDetailsToDomain(detailData, overviewLanguage);
  }

  async getRecommendations(
    movieId: number,
    options?: { signal?: AbortSignal },
  ): Promise<import("../../domain/movie.js").Movie[]> {
    const response = await this.#client.get(
      `/movie/${movieId}/recommendations`,
      undefined,
      options,
    );

    const parsed = TmdbPaginatedResponseSchema.safeParse(response);
    if (!parsed.success) {
      throw new Error(
        `Invalid TMDB recommendations response: ${parsed.error.message}`,
      );
    }

    return parsed.data.results.map((movie) => this.#transformToDomain(movie));
  }

  #transformToDomain(
    tmdbMovie: TmdbMovie,
  ): import("../../domain/movie.js").Movie {
    return createMovie({
      id: tmdbMovie.id,
      title: tmdbMovie.title,
      original_title: tmdbMovie.original_title,
      overview: tmdbMovie.overview,
      poster_path: tmdbMovie.poster_path,
      release_date: tmdbMovie.release_date,
      runtime: tmdbMovie.runtime,
      genres: tmdbMovie.genres ?? [],
      budget: tmdbMovie.budget,
      vote_count: tmdbMovie.vote_count,
      vote_average: tmdbMovie.vote_average,
    });
  }

  #transformDetailsToDomain(
    tmdbDetails: z.infer<typeof TmdbMovieDetailsSchema>,
    overviewLanguage?: "es" | "en",
  ): import("../../domain/movie.js").Movie {
    const director =
      tmdbDetails.credits?.crew?.find((c) => c.job === "Director")?.name ??
      null;

    const cast =
      tmdbDetails.credits?.cast?.slice(0, 8).map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character ?? null,
        profilePath: c.profile_path ?? null,
      })) ?? [];

    const trailerKey =
      tmdbDetails.videos?.results?.find(
        (v) =>
          v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
      )?.key ??
      tmdbDetails.videos?.results?.[0]?.key ??
      null;

    return createMovie({
      id: tmdbDetails.id,
      title: tmdbDetails.title,
      original_title: tmdbDetails.original_title,
      overview: tmdbDetails.overview,
      overviewLanguage,
      poster_path: tmdbDetails.poster_path,
      release_date: tmdbDetails.release_date,
      runtime: tmdbDetails.runtime,
      genres: tmdbDetails.genres ?? [],
      budget: tmdbDetails.budget,
      vote_count: tmdbDetails.vote_count,
      vote_average: tmdbDetails.vote_average,
      director,
      cast,
      trailerKey,
    });
  }
}
