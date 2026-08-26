import { z } from "zod";

const CURRENT_YEAR = new Date().getFullYear();

export const ExploreParamsSchema = z.object({
  genre: z.coerce.number().int().positive().optional(),
  year: z.coerce
    .number()
    .int()
    .min(1888)
    .max(CURRENT_YEAR + 5)
    .optional(),
  voteAverageMin: z.coerce.number().min(0).max(10).optional(),
  voteCountMin: z.coerce.number().int().nonnegative().optional(),
  sortBy: z
    .enum(["popularity", "vote_average", "vote_count", "release_date"])
    .default("popularity"),
});

export type ValidatedExploreParams = z.infer<typeof ExploreParamsSchema>;

export const DEFAULT_EXPLORE_PARAMS: ValidatedExploreParams = {
  sortBy: "popularity",
};

export function parseExploreParams(
  searchParams: URLSearchParams,
): ValidatedExploreParams {
  const raw: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    if (value.trim() !== "") {
      raw[key] = value.trim();
    }
  }

  const result = ExploreParamsSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }

  return DEFAULT_EXPLORE_PARAMS;
}

export function normalizeExploreParams(
  params: ValidatedExploreParams,
): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  if (params.genre !== undefined) normalized.genre = params.genre;
  if (params.year !== undefined) normalized.year = params.year;
  if (params.voteAverageMin !== undefined)
    normalized.voteAverageMin = params.voteAverageMin;
  if (params.voteCountMin !== undefined)
    normalized.voteCountMin = params.voteCountMin;
  if (params.sortBy !== "popularity") normalized.sortBy = params.sortBy;

  return normalized;
}

export function buildSearchParams(
  params: ValidatedExploreParams,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.genre !== undefined) {
    searchParams.set("genre", params.genre.toString());
  }

  if (params.year !== undefined) {
    searchParams.set("year", params.year.toString());
  }

  if (params.voteAverageMin !== undefined) {
    searchParams.set("voteAverageMin", params.voteAverageMin.toString());
  }

  if (params.voteCountMin !== undefined) {
    searchParams.set("voteCountMin", params.voteCountMin.toString());
  }

  if (params.sortBy && params.sortBy !== "popularity") {
    searchParams.set("sortBy", params.sortBy);
  }

  return searchParams;
}

export function hasActiveFilters(params: ValidatedExploreParams): boolean {
  return (
    params.genre !== undefined ||
    params.year !== undefined ||
    params.voteAverageMin !== undefined ||
    params.voteCountMin !== undefined ||
    params.sortBy !== "popularity"
  );
}
