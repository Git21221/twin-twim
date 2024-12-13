import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import PrivateRoute from "./routes/ProtectedRoute";
import { RootState } from "./store/store";
import { useSelector } from "react-redux";
import Login from "./pages/Login";
import Validate from "./pages/Validate";

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      <Route path="/" element={<Validate />}>
        <Route
          path="/login"
          element={
            !isAuthenticated ? <Login /> : <Navigate to="/home" replace />
          }
        />
        <Route element={<PrivateRoute />}>
          <Route
            path="/home"
            element={
              isAuthenticated ? <Home /> : <Navigate to="/login" replace />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
