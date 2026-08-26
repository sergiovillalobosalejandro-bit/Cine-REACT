import { AlertTriangle, RefreshCw } from "lucide-react";
import { TEXTS } from "../texts/es.js";

interface ErrorStateProps {
  title?: string | undefined;
  description?: string | undefined;
  onRetry?: (() => void) | undefined;
}

export function ErrorState({
  title = TEXTS.components.errorState.title,
  description = TEXTS.components.errorState.desc,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-rose-950/20 rounded-2xl border border-rose-900/40 my-6">
      <div className="p-4 bg-rose-500/10 rounded-full text-rose-400 mb-4 border border-rose-500/20">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-rose-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-rose-600/20"
        >
          <RefreshCw className="w-4 h-4" />
          {TEXTS.components.errorState.retry}
        </button>
      )}
    </div>
  );
}
