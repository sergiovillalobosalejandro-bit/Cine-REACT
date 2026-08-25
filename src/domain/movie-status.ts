export type MovieStatus =
  | { kind: "released"; releaseDate: Date }
  | { kind: "unreleased"; releaseDate: Date }
  | { kind: "unknown" };

export function createMovieStatus(
  releaseDate: string | null | undefined,
): MovieStatus {
  if (!releaseDate || releaseDate === "") {
    return { kind: "unknown" };
  }

  const date = new Date(releaseDate);
  if (isNaN(date.getTime())) {
    return { kind: "unknown" };
  }

  const now = new Date();
  if (date > now) {
    return { kind: "unreleased", releaseDate: date };
  }

  return { kind: "released", releaseDate: date };
}
