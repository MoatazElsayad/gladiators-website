import { createHashRouter, Outlet, RouterProvider, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './lib/auth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import AiCoach from './pages/AiCoach'
import HighlightDetail from './pages/HighlightDetail'
import AuthPage from './pages/AuthPage'
import Profile from './pages/Profile'

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return null
}

function RootLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-arena-void text-arena-parchment">
      <div className="pointer-events-none absolute inset-0 bg-arena-glow opacity-90" />
      <div className="pointer-events-none absolute inset-0 bg-stone-texture bg-[length:40px_40px] opacity-10" />
      <ScrollToTop />
      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      { path: 'coach', element: <AiCoach /> },
      { path: 'coach/:highlightId', element: <HighlightDetail /> },
      { path: 'login', element: <AuthPage mode="login" /> },
      { path: 'register', element: <AuthPage mode="register" /> },
      { path: 'profile', element: <Profile /> }
    ]
  }
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
