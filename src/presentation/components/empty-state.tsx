import { Film } from "lucide-react";
import { TEXTS } from "../texts/es.js";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = TEXTS.components.emptyState.defaultTitle,
  description = TEXTS.components.emptyState.defaultDesc,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 my-6">
      <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-400 mb-4 border border-indigo-500/20">
        <Film className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/40"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
