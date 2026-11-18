import { RouterProvider } from "react-router";
import { router } from "@/routes";

// Authentication is added later: wrap <RouterProvider> in <AuthProvider> then.
export default function App() {
  return <RouterProvider router={router} />;
}
