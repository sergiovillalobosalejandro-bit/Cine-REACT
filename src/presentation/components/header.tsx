import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Film, Search, Bookmark, Compass, Home } from "lucide-react";
import { TEXTS } from "../texts/es.js";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 text-white rounded-xl shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-100 tracking-tight group-hover:text-indigo-400 transition-colors">
            {TEXTS.app.title}
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`
            }
          >
            <Home className="w-3.5 h-3.5" />
            <span>{TEXTS.nav.home}</span>
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`
            }
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{TEXTS.nav.explore}</span>
          </NavLink>

          <NavLink
            to="/library"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`
            }
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{TEXTS.nav.library}</span>
          </NavLink>
        </nav>

        {/* Search input form */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 max-w-xs"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={TEXTS.nav.searchPlaceholder}
            className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs font-medium rounded-xl border border-slate-800 pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </form>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 py-2 px-4 bg-slate-950/90">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium ${
              isActive ? "text-indigo-400" : "text-slate-400"
            }`
          }
        >
          <Home className="w-4 h-4" />
          <span>{TEXTS.nav.home}</span>
        </NavLink>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium ${
              isActive ? "text-indigo-400" : "text-slate-400"
            }`
          }
        >
          <Compass className="w-4 h-4" />
          <span>{TEXTS.nav.explore}</span>
        </NavLink>

        <NavLink
          to="/library"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium ${
              isActive ? "text-indigo-400" : "text-slate-400"
            }`
          }
        >
          <Bookmark className="w-4 h-4" />
          <span>{TEXTS.nav.library}</span>
        </NavLink>
      </div>
    </header>
  );
}
