import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import { store } from "./store/store.ts";
import Register from "./pages/Register.tsx";
import Chat from "./pages/Chat.tsx";
import PrivateRoute from "./routes/ProtectedRoute.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      // Protected routes, wrapped in PrivateRoute
      {
        path: "/chat/:personToChat/:name",
        element: (
          <PrivateRoute>
            <Chat />
          </PrivateRoute>
        ),
      },
      {
        path: "/",
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);
