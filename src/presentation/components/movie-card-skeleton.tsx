export function MovieCardSkeleton() {
  return (
    <div className="flex flex-col bg-slate-900/60 rounded-xl overflow-hidden border border-slate-800 animate-pulse">
      <div className="aspect-[2/3] w-full bg-slate-800" />
      <div className="p-3.5 flex flex-col gap-2">
        <div className="h-4 bg-slate-800 rounded w-3/4" />
        <div className="flex items-center justify-between mt-1">
          <div className="h-3 bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
