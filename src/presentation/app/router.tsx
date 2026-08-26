import { createBrowserRouter } from "react-router";
import { AppLayout } from "../layouts/app-layout.js";
import { HomePage } from "../pages/home-page.js";
import { ExplorePage } from "../pages/explore-page.js";
import { SearchPage } from "../pages/search-page.js";
import { MovieDetailPage } from "../pages/movie-detail-page.js";
import { LibraryPage } from "../pages/library-page.js";
import { ListDetailPage } from "../pages/list-detail-page.js";
import { NotFoundPage } from "../pages/not-found-page.js";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "explore",
        element: <ExplorePage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "movies/:movieId",
        element: <MovieDetailPage />,
      },
      {
        path: "library",
        element: <LibraryPage />,
      },
      {
        path: "library/lists/:listId",
        element: <ListDetailPage />,
      },
      {
        // Ruta comodin: entra solo cuando ninguna de las anteriores
        // coincidio. Va ultima a proposito.
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
