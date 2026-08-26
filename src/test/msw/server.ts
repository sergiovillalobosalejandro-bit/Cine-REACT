import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("https://api.themoviedb.org/3/trending/movie/:timeWindow", () => {
    return HttpResponse.json({
      page: 1,
      results: [
        {
          id: 1,
          title: "Inception",
          original_title: "Inception",
          overview: "A dream within a dream.",
          poster_path: "/inception.jpg",
          release_date: "2010-07-16",
          vote_average: 8.8,
          vote_count: 30000,
        },
      ],
      total_pages: 1,
      total_results: 1,
    });
  }),
];

export const server = setupServer(...handlers);
