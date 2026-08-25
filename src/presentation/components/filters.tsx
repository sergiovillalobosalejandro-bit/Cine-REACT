import { SlidersHorizontal, RotateCcw } from "lucide-react";
import {
  type ValidatedExploreParams,
  hasActiveFilters,
  DEFAULT_EXPLORE_PARAMS,
} from "../lib/explore-params.js";
import { TEXTS } from "../texts/es.js";

const GENRES = [
  { id: 28, name: "Acción" },
  { id: 12, name: "Aventura" },
  { id: 16, name: "Animación" },
  { id: 35, name: "Comedia" },
  { id: 80, name: "Crimen" },
  { id: 99, name: "Documental" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Familia" },
  { id: 14, name: "Fantasía" },
  { id: 36, name: "Historia" },
  { id: 27, name: "Terror" },
  { id: 10402, name: "Música" },
  { id: 9648, name: "Misterio" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Ciencia Ficción" },
  { id: 53, name: "Suspense" },
  { id: 10752, name: "Bélica" },
  { id: 37, name: "Wéstern" },
];

const YEARS = Array.from(
  { length: 45 },
  (_, i) => new Date().getFullYear() - i,
);

const MIN_RATINGS = [
  { value: 5, label: "★ 5.0+" },
  { value: 6, label: "★ 6.0+" },
  { value: 7, label: "★ 7.0+" },
  { value: 8, label: "★ 8.0+" },
  { value: 9, label: "★ 9.0+" },
];

const MIN_VOTES = [
  { value: 50, label: "50+ votos" },
  { value: 100, label: "100+ votos" },
  { value: 500, label: "500+ votos" },
  { value: 1000, label: "1,000+ votos" },
  { value: 5000, label: "5,000+ votos" },
];

interface FiltersProps {
  params: ValidatedExploreParams;
  onChange: (newParams: ValidatedExploreParams) => void;
}

export function Filters({ params, onChange }: FiltersProps) {
  const isFiltered = hasActiveFilters(params);

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 backdrop-blur-md mb-6">
      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mr-1">
        <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
        <span>Filtros</span>
      </div>

      {/* Genre select */}
      <div className="flex-1 min-w-[140px]">
        <select
          value={params.genre ?? ""}
          onChange={(e) =>
            onChange({
              ...params,
              genre: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="w-full bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">{TEXTS.explore.filters.allGenres}</option>
          {GENRES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Year select */}
      <div className="min-w-[110px]">
        <select
          value={params.year ?? ""}
          onChange={(e) =>
            onChange({
              ...params,
              year: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="w-full bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">{TEXTS.explore.filters.allYears}</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Vote Average Min select */}
      <div className="min-w-[120px]">
        <select
          value={params.voteAverageMin ?? ""}
          onChange={(e) =>
            onChange({
              ...params,
              voteAverageMin: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
          className="w-full bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">{TEXTS.explore.filters.allRatings}</option>
          {MIN_RATINGS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Vote Count Min select */}
      <div className="min-w-[130px]">
        <select
          value={params.voteCountMin ?? ""}
          onChange={(e) =>
            onChange({
              ...params,
              voteCountMin: e.target.value ? Number(e.target.value) : undefined,
            })
          }
          className="w-full bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">{TEXTS.explore.filters.allVotes}</option>
          {MIN_VOTES.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort order select */}
      <div className="min-w-[150px]">
        <select
          value={params.sortBy ?? "popularity"}
          onChange={(e) =>
            onChange({
              ...params,
              sortBy: e.target.value as ValidatedExploreParams["sortBy"],
            })
          }
          className="w-full bg-slate-800 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="popularity">
            {TEXTS.explore.filters.sortPopularity}
          </option>
          <option value="vote_average">
            {TEXTS.explore.filters.sortRating}
          </option>
          <option value="release_date">
            {TEXTS.explore.filters.sortReleaseDate}
          </option>
          <option value="vote_count">
            {TEXTS.explore.filters.sortVoteCount}
          </option>
        </select>
      </div>

      {/* Clear Filters Button */}
      {isFiltered && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_EXPLORE_PARAMS)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{TEXTS.explore.clearFilters}</span>
        </button>
      )}
    </div>
  );
}
