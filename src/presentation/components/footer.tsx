import { Film } from "lucide-react";
import { TEXTS } from "../texts/es.js";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <Film className="w-4 h-4 text-emerald-400" />
          <span>{TEXTS.app.title}</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400 font-normal">
            {TEXTS.app.tagline}
          </span>
        </div>

        <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
          {TEXTS.footer.disclaimer}
        </p>

        <p className="text-xs text-slate-600">
          &copy; {new Date().getFullYear()} {TEXTS.app.title}.{" "}
          {TEXTS.footer.rights}
        </p>
      </div>
    </footer>
  );
}
