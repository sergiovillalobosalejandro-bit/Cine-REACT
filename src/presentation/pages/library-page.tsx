import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  ListPlus,
  FolderHeart,
  Plus,
  ChevronRight,
} from "lucide-react";
import { libraryRepository } from "../lib/services.js";
import { createList } from "../../application/use-cases/manage-lists.js";
import { toggleLibraryMovie } from "../../application/use-cases/toggle-library-movie.js";
import type { Movie } from "../../domain/movie.js";
import { MovieGrid } from "../components/movie-grid.js";
import { EmptyState } from "../components/empty-state.js";
import { ListForm } from "../components/list-form.js";
import { TEXTS } from "../texts/es.js";

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<"saved" | "lists">("saved");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch saved movies
  const { data: savedMovies, isLoading: isLoadingSaved } = useQuery({
    queryKey: ["library-saved-movies"],
    queryFn: () => libraryRepository.getAll(),
  });

  // Fetch lists
  const { data: lists, isLoading: isLoadingLists } = useQuery({
    queryKey: ["library-lists"],
    queryFn: () => libraryRepository.getLists(),
  });

  // Toggle Save Mutation
  const toggleSaveMutation = useMutation({
    mutationFn: (movie: Movie) => toggleLibraryMovie(libraryRepository, movie),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-saved-movies"] });
    },
  });

  // Create List Mutation
  const createListMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      createList(libraryRepository, data.name, data.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-lists"] });
      setIsCreateModalOpen(false);
    },
  });

  const savedMovieIds = new Set(savedMovies?.map((m) => m.id) ?? []);
  const existingListNames = lists?.map((l) => l.name) ?? [];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-2 border-b border-slate-800/80 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                {TEXTS.library.title}
              </h1>
              <p className="text-slate-400 text-sm">{TEXTS.library.subtitle}</p>
            </div>
          </div>

          {activeTab === "lists" && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>{TEXTS.library.createListButton}</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              activeTab === "saved"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <FolderHeart className="w-4 h-4" />
            <span>{TEXTS.library.tabs.saved}</span>
            {savedMovies && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-950/60 text-[10px] font-bold">
                {savedMovies.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lists")}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              activeTab === "lists"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            <ListPlus className="w-4 h-4" />
            <span>{TEXTS.library.tabs.lists}</span>
            {lists && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-950/60 text-[10px] font-bold">
                {lists.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab 1: Saved Movies */}
      {activeTab === "saved" && (
        <MovieGrid
          movies={savedMovies}
          isLoading={isLoadingSaved}
          savedMovieIds={savedMovieIds}
          onToggleSave={(movie) => toggleSaveMutation.mutate(movie)}
          emptyTitle={TEXTS.library.savedEmptyTitle}
          emptyDesc={TEXTS.library.savedEmptyDesc}
        />
      )}

      {/* Tab 2: Custom Lists */}
      {activeTab === "lists" && (
        <div>
          {isLoadingLists ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
              <div className="h-32 bg-slate-900 rounded-2xl" />
              <div className="h-32 bg-slate-900 rounded-2xl" />
            </div>
          ) : !lists || lists.length === 0 ? (
            <EmptyState
              title={TEXTS.library.listsEmptyTitle}
              description={TEXTS.library.listsEmptyDesc}
              actionLabel={TEXTS.library.createListButton}
              onAction={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {lists.map((list) => (
                <Link
                  key={list.id}
                  to={`/library/lists/${list.id}`}
                  className="group flex flex-col justify-between p-5 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors text-base">
                        {list.name}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    {list.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {list.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/60 mt-4">
                    <span>
                      {list.movieIds.length} {TEXTS.library.movieCount}
                    </span>
                    <span>
                      {new Intl.DateTimeFormat("es-ES", {
                        dateStyle: "short",
                      }).format(list.updatedAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create List */}
      {isCreateModalOpen && (
        <ListForm
          existingListNames={existingListNames}
          onSubmit={createListMutation.mutateAsync}
          onClose={() => setIsCreateModalOpen(false)}
          title={TEXTS.library.createListModalTitle}
          isPending={createListMutation.isPending}
        />
      )}
    </div>
  );
}
