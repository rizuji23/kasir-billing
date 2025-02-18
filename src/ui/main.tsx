import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { HashRouter } from 'react-router'
import { HeroUIProvider } from '@heroui/react'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <HeroUIProvider>
        <main className="dark text-foreground bg-background w-full h-screen overflow-auto">
          <Toaster position='top-right' richColors closeButton />
          <App />
        </main>
      </HeroUIProvider>
    </HashRouter>
  </StrictMode>,
)
