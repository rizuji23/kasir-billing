import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { HeroUIProvider } from "@heroui/react";
import { HashRouter, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";
import { ToastProvider } from "@heroui/react";
const MainWrapper = () => {
  const location = useLocation();
  const isStrukPage = location.pathname === "/struk";

  return (
    <main
      className={`${isStrukPage ? "light" : "dark"
        } text-foreground bg-background w-full h-screen overflow-auto`}
    >
      <App />
    </main>
  );
};

createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <Toaster position="top-right" />
    <HeroUIProvider>
      <ToastProvider placement="top-right" toastOffset={10} />
      <MainWrapper />
    </HeroUIProvider>
  </HashRouter>
);
