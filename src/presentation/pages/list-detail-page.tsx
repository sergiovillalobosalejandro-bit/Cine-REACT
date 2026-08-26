import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListFilter, Edit3, Trash2, Calendar, Clock } from "lucide-react";
import { libraryRepository } from "../lib/services.js";
import {
  updateList,
  deleteList,
  removeMovieFromList,
} from "../../application/use-cases/manage-lists.js";
import type { Movie } from "../../domain/movie.js";
import { MovieGrid } from "../components/movie-grid.js";
import { ErrorState } from "../components/error-state.js";
import { ListForm } from "../components/list-form.js";
import { TEXTS } from "../texts/es.js";

export function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch list metadata
  const {
    data: list,
    isLoading: isLoadingList,
    isError: isErrorList,
  } = useQuery({
    queryKey: ["library-list", listId],
    queryFn: async () => {
      const lists = await libraryRepository.getLists();
      const found = lists.find((l) => l.id === listId);
      if (!found) throw new Error("Lista no encontrada");
      return found;
    },
    enabled: Boolean(listId),
  });

  // Fetch all lists for duplicate name checking
  const { data: allLists } = useQuery({
    queryKey: ["library-lists"],
    queryFn: () => libraryRepository.getLists(),
  });

  // Fetch movies in the list from local library storage
  const { data: movies, isLoading: isLoadingMovies } = useQuery({
    queryKey: ["list-movies", list?.movieIds],
    queryFn: async () => {
      if (!list || list.movieIds.length === 0) return [];
      const moviesList: Movie[] = [];
      for (const id of list.movieIds) {
        const stored = await libraryRepository.getById(id);
        if (stored) {
          moviesList.push(stored);
        }
      }
      return moviesList;
    },
    enabled: Boolean(list),
  });

  // Update List Mutation
  const updateMutation = useMutation({
    mutationFn: (data: { name: string; description?: string | undefined }) =>
      updateList(libraryRepository, listId!, data.name, data.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-list", listId] });
      queryClient.invalidateQueries({ queryKey: ["library-lists"] });
      setIsEditModalOpen(false);
    },
  });

  // Delete List Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!listId) return;
      await deleteList(libraryRepository, listId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-lists"] });
      navigate("/library");
    },
  });

  // Remove Movie From List Mutation
  const removeMovieMutation = useMutation({
    mutationFn: async (movieId: number) => {
      if (!listId) return;
      await removeMovieFromList(libraryRepository, listId, movieId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["library-list", listId] });
      queryClient.invalidateQueries({ queryKey: ["list-movies"] });
    },
  });

  const handleDeleteConfirm = () => {
    if (window.confirm(TEXTS.listDetail.deleteConfirm)) {
      deleteMutation.mutate();
    }
  };

  if (isLoadingList) {
    return <div className="h-64 bg-slate-900 rounded-3xl animate-pulse" />;
  }

  if (isErrorList || !list) {
    return (
      <ErrorState description="La lista solicitada no existe o fue eliminada." />
    );
  }

  const createdAtFormatted = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
  }).format(list.createdAt);
  const updatedAtFormatted = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
  }).format(list.updatedAt);

  const existingListNames = allLists?.map((l) => l.name) ?? [];

  return (
    <div className="flex flex-col gap-8">
      {/* Header section */}
      <div className="flex flex-col gap-4 bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 mt-1">
              <ListFilter className="w-6 h-6" />
            </div>

            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                {list.name}
              </h1>
              {list.description && (
                <p className="text-sm text-slate-400 max-w-xl">
                  {list.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{TEXTS.listDetail.editList}</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-xl border border-rose-900/50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{TEXTS.listDetail.deleteList}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500 border-t border-slate-800/80 pt-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {TEXTS.listDetail.createdAt} {createdAtFormatted}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {TEXTS.listDetail.updatedAt} {updatedAtFormatted}
          </span>
          <span className="font-semibold text-slate-400">
            {list.movieIds.length} {TEXTS.library.movieCount}
          </span>
        </div>
      </div>

      {/* Movie Grid */}
      <MovieGrid
        movies={movies}
        isLoading={isLoadingMovies}
        onRemoveMovie={(movieId) => removeMovieMutation.mutate(movieId)}
        emptyTitle={TEXTS.listDetail.emptyTitle}
        emptyDesc={TEXTS.listDetail.emptyDesc}
      />

      {/* Edit List Modal */}
      {isEditModalOpen && list && (
        <ListForm
          initialData={list}
          existingListNames={existingListNames}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync(data);
          }}
          onClose={() => setIsEditModalOpen(false)}
          title={TEXTS.listDetail.editModalTitle}
          isPending={updateMutation.isPending}
        />
      )}
    </div>
  );
}
