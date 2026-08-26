import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { env } from "../../config/env.js";

export class TmdbError extends Error {
  code?: string | number;
  retryAfter?: number;

  constructor(message: string, code?: string | number, retryAfter?: number) {
    super(message);
    this.name = "TmdbError";
    if (code !== undefined) this.code = code;
    if (retryAfter !== undefined) this.retryAfter = retryAfter;
  }
}

export class TmdbClient {
  #baseURL: string;
  #token: string;

  constructor() {
    // La API de TMDB vive bajo /3. VITE_TMDB_API_BASE solo trae el host
    // (https://api.themoviedb.org), asi que la version se agrega aqui:
    // sin ella, la API responde 404 a todas las peticiones.
    this.#baseURL = `${env.VITE_TMDB_API_BASE}/3`;
    this.#token = env.VITE_TMDB_READ_TOKEN;
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: { signal?: AbortSignal },
  ): Promise<T> {
    try {
      // Con exactOptionalPropertyTypes no se puede pasar "signal: undefined":
      // o la clave existe con un valor, o no existe. Por eso las agregamos
      // solo cuando de verdad hay algo que pasar.
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${this.#token}`,
          "Content-Type": "application/json",
        },
      };
      if (params) config.params = params;
      if (options?.signal) config.signal = options.signal;

      const response = await axios.get<T>(
        `${this.#baseURL}${endpoint}`,
        config,
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as {
            status_code?: number;
            status_message?: string;
          };

          // TMDB error codes
          if (data.status_code === 34) {
            throw new TmdbError("Recurso no encontrado", "NOT_FOUND");
          }

          if (data.status_code === 22) {
            throw new TmdbError("Página inválida", "INVALID_PAGE");
          }

          // HTTP 429 - Rate limit
          if (status === 429) {
            const retryAfter = error.response.headers["retry-after"];
            const waitSeconds = retryAfter
              ? parseInt(retryAfter, 10)
              : undefined;
            throw new TmdbError(
              "Límite de peticiones excedido. Por favor espera.",
              "RATE_LIMIT",
              waitSeconds,
            );
          }

          // 404
          if (status === 404) {
            throw new TmdbError("Recurso no encontrado", "NOT_FOUND");
          }

          // Other HTTP errors
          throw new TmdbError(
            data.status_message || `Error del servidor: ${status}`,
            status.toString(),
          );
        }

        // Network error
        if (error.request) {
          throw new TmdbError(
            "Error de red. Por favor verifica tu conexión",
            "NETWORK_ERROR",
          );
        }
      }

      throw new TmdbError(
        "Error desconocido al conectar con TMDB",
        "UNKNOWN_ERROR",
      );
    }
  }
}
