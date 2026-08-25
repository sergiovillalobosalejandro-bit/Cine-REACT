import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./src/test/msw/server.ts";

// Mock env for infrastructure tests
vi.mock("./src/config/env.js", () => ({
  env: {
    VITE_TMDB_READ_TOKEN: "test-token",
    VITE_TMDB_API_BASE: "https://api.themoviedb.org",
    VITE_TMDB_IMAGE_BASE: "https://image.tmdb.org/t/p",
  },
}));

// onUnhandledRequest: 'error' es la línea que hace útil a MSW: una petición que
// nadie simuló revienta el test en vez de irse a la red de verdad.
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => {
  server.resetHandlers();
  cleanup();
  globalThis.localStorage.clear();
});
afterAll(() => {
  server.close();
});

// jsdom no implementa ninguno de los dos, y el tema y el virtualizador los piden.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
globalThis.ResizeObserver = class {
  observe() {
    // Empty implementation for testing
  }
  unobserve() {
    // Empty implementation for testing
  }
  disconnect() {
    // Empty implementation for testing
  }
};

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  configurable: true,
});
