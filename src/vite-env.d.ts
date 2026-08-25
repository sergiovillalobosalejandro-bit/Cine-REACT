/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TMDB_READ_TOKEN: string;
  readonly VITE_TMDB_API_BASE: string;
  readonly VITE_TMDB_IMAGE_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
