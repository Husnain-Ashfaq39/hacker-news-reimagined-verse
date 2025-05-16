import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import "./index.css";
import { AuthInit } from "./components/AuthInit";

// Lazy load the main App component
const App = lazy(() => import("./App"));

// Loading spinner for app initialization
const AppLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-12 w-12 border-4 border-t-hn-orange border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <>
    <AuthInit />
    <Suspense fallback={<AppLoadingSpinner />}>
      <App />
    </Suspense>
  </>
);
