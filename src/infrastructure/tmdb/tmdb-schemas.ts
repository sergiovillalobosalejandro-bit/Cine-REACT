import { z } from "zod";

export const TmdbGenreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const TmdbMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().nullable(),
  overview: z.string().nullable(),
  poster_path: z.string().nullable(),
  release_date: z.string().nullable(),
  runtime: z.number().nullable(),
  genres: z
    .array(z.object({ id: z.number(), name: z.string() }).nullable())
    .optional(),
  budget: z.number().nullable().optional(),
  vote_count: z.number().nullable().optional(),
  vote_average: z.number().nullable().optional(),
});

export const TmdbPaginatedResponseSchema = z.object({
  page: z.number(),
  total_pages: z.number(),
  total_results: z.number(),
  results: z.array(TmdbMovieSchema),
});

export const TmdbGenreListSchema = z.object({
  genres: z.array(TmdbGenreSchema),
});

export const TmdbMovieDetailsSchema = z.object({
  id: z.number(),
  title: z.string(),
  original_title: z.string().nullable(),
  overview: z.string().nullable(),
  poster_path: z.string().nullable(),
  release_date: z.string().nullable(),
  runtime: z.number().nullable(),
  genres: z
    .array(z.object({ id: z.number(), name: z.string() }).nullable())
    .optional(),
  budget: z.number().nullable().optional(),
  vote_count: z.number().nullable().optional(),
  vote_average: z.number().nullable().optional(),
  credits: z
    .object({
      cast: z
        .array(
          z.object({
            id: z.number(),
            name: z.string(),
            character: z.string().nullable().optional(),
            profile_path: z.string().nullable().optional(),
          }),
        )
        .optional(),
      crew: z
        .array(
          z.object({
            id: z.number(),
            name: z.string(),
            job: z.string(),
          }),
        )
        .optional(),
    })
    .optional(),
  videos: z
    .object({
      results: z
        .array(
          z.object({
            id: z.string(),
            key: z.string(),
            name: z.string(),
            site: z.string(),
            type: z.string(),
          }),
        )
        .optional(),
    })
    .optional(),
});

export const TmdbErrorResponseSchema = z.object({
  status_code: z.number().optional(),
  status_message: z.string().optional(),
  success: z.boolean().optional(),
});
