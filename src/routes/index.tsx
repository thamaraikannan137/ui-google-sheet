import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "../components/layout";
import { HomePage } from "../pages/HomePage";
import { AboutPage } from "../pages/AboutPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { LiabilitiesPage } from "../pages/LiabilitiesPage";
import { ProjectsPage } from "../pages/ProjectsPage";
import { GoogleAuthCallbackPage } from "../pages/GoogleAuthCallbackPage";


const router = createBrowserRouter([
  {
    // Routes with MainLayout
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
      {
        path: "projects/:projectId/liabilities",
        element: <LiabilitiesPage />,
      },
    ],
  },
  {
    // Routes without layout (standalone pages)
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/auth/google/callback",
    element: <GoogleAuthCallbackPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
