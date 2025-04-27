import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthInit } from "./components/AuthInit";

createRoot(document.getElementById("root")!).render(
  <>
    <AuthInit />
    <App />
  </>
);
