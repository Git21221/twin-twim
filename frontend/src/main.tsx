import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.tsx";
import { store } from "./store/store.ts";
import { SocketProvider } from "./context/SocketContext.tsx";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
      <Router>
    <SocketProvider>
        <App />
    </SocketProvider>
      </Router>
  </Provider>
);
