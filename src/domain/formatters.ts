import type { Movie } from "./movie.js";
import type { MovieStatus } from "./movie-status.js";

export function formatDate(
  date: Date | null,
  locale: string = "en-US",
): string {
  if (!date) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatRuntime(
  minutes: number | null,
  locale: string = "en-US",
): string {
  if (!minutes) {
    return "Unknown";
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return new Intl.NumberFormat(locale).format(mins) + "m";
  }

  if (mins === 0) {
    return new Intl.NumberFormat(locale).format(hours) + "h";
  }

  return `${new Intl.NumberFormat(locale).format(hours)}h ${new Intl.NumberFormat(locale).format(mins)}m`;
}

export function formatMovieStatus(status: MovieStatus): string {
  switch (status.kind) {
    case "released":
      return "Released";
    case "unreleased":
      return "Coming Soon";
    case "unknown":
      return "Unknown";
  }
}

export function formatGenres(
  genres: Array<{ name: string }>,
  locale: string = "en-US",
): string {
  if (genres.length === 0) {
    return "Unknown";
  }

  const names = genres.map((g) => g.name);

  if (names.length === 1) {
    return names[0]!;
  }

  if (names.length === 2) {
    return names.join(" & ");
  }

  const formatter = new Intl.ListFormat(locale, {
    style: "long",
    type: "conjunction",
  });
  return formatter.format(names);
}

export function formatMovieTitle(movie: Movie): string {
  if (movie.originalTitle && movie.originalTitle !== movie.title) {
    return `${movie.title} (${movie.originalTitle})`;
  }
  return movie.title;
}
