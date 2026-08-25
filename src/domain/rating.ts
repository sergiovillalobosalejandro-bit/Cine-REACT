export type Rating =
  | { kind: "no-votes" }
  | { kind: "few-votes"; voteCount: number; average: number }
  | { kind: "established"; voteCount: number; average: number };

export function createRating(
  voteCount: number | null | undefined,
  average: number | null | undefined,
): Rating {
  const count = voteCount ?? 0;
  const avg = average ?? 0;

  if (count === 0) {
    return { kind: "no-votes" };
  }

  if (count < 100) {
    return { kind: "few-votes", voteCount: count, average: avg };
  }

  return { kind: "established", voteCount: count, average: avg };
}

export function formatRating(rating: Rating, locale: string = "en-US"): string {
  switch (rating.kind) {
    case "no-votes":
      return "No votes";
    case "few-votes":
    case "established":
      return new Intl.NumberFormat(locale, {
        style: "decimal",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(rating.average);
  }
}
