import { Link } from "react-router";
import { Compass, Home, SearchX } from "lucide-react";
import { TEXTS } from "../texts/es.js";

/**
 * Pantalla para direcciones que no corresponden a ninguna ruta.
 *
 * Se registra como ruta comodin (path: "*") hija del layout, asi que
 * aparece dentro de la cabecera y el pie: el usuario sigue teniendo la
 * navegacion a mano en vez de quedarse en una pagina sin salida.
 */
export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-400 mb-6 border border-indigo-500/20">
        <SearchX className="w-10 h-10" />
      </div>

      <p className="text-5xl font-bold text-slate-700 mb-3">
        {TEXTS.notFound.code}
      </p>

      <h1 className="text-2xl font-semibold text-slate-100 mb-2">
        {TEXTS.notFound.title}
      </h1>

      <p className="text-sm text-slate-400 max-w-md mb-8">
        {TEXTS.notFound.description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/40"
        >
          <Home className="w-4 h-4" />
          <span>{TEXTS.notFound.goHome}</span>
        </Link>

        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-xl border border-slate-700 transition-all"
        >
          <Compass className="w-4 h-4" />
          <span>{TEXTS.notFound.goExplore}</span>
        </Link>
      </div>
    </div>
  );
}
