import DefaultLayout from "@/layouts/DefaultLayout";
import { createBrowserRouter } from "react-router";
import Home from "./components/Home";

const router = createBrowserRouter([
  {
    Component: DefaultLayout,
    children: [
      {
        index: true,
        Component: Home,
      }
    ],
  }
]);

export default router;