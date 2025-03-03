import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "sonner";
import { HashRouter, useLocation } from "react-router";

const MainWrapper = () => {
  const location = useLocation();
  const isStrukPage = location.pathname === "/struk";

  return (
    <main
      className={`${isStrukPage ? "light" : "dark"
        } text-foreground bg-background w-full h-screen overflow-auto`}
    >
      <Toaster position="top-right" richColors closeButton />
      <App />
    </main>
  );
};

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <HeroUIProvider>
      <MainWrapper />
    </HeroUIProvider>
  </HashRouter>
);
