import { RouterProvider } from "react-router";
import { Providers } from "./presentation/app/providers.js";
import { router } from "./presentation/app/router.js";

export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
