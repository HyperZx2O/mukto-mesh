import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWs, initWs, closeWs, setQueryClient } from '@/lib/ws'
import ErrorBoundary from '@/components/ErrorBoundary'
import Layout from '@/components/Layout'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Chat = lazy(() => import('@/pages/Chat'))
const Noticeboard = lazy(() => import('@/pages/Noticeboard'))
const KnowledgeBase = lazy(() => import('@/pages/KnowledgeBase'))
const CheckIn = lazy(() => import('@/pages/CheckIn'))
const MissingPersons = lazy(() => import('@/pages/MissingPersons'))
const News = lazy(() => import('@/pages/News'))
const Map = lazy(() => import('@/pages/Map'))
const Admin = lazy(() => import('@/pages/Admin'))

export default function App() {
  const queryClient = useQueryClient()
  const broadcast = useWs((s) => s.broadcast)
  const dismissBroadcast = useWs((s) => s.dismissBroadcast)

  useEffect(() => {
    setQueryClient(queryClient)
    initWs()
    return () => closeWs()
  }, [queryClient])

  return (
    <BrowserRouter>
      <ErrorBoundary>
      <Suspense fallback={<div className="p-4 animate-pulse space-y-3"><div className="h-6 bg-border w-48" /><div className="h-4 bg-border w-64" /><div className="h-4 bg-border w-32" /></div>}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/board" element={<Noticeboard />} />
          <Route path="/info/*" element={<KnowledgeBase />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/people" element={<MissingPersons />} />
          <Route path="/news" element={<News />} />
          <Route path="/map" element={<Map />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
      </Suspense>
      {broadcast && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="bg-surface border-2 border-danger p-8 max-w-lg mx-4 text-center">
            <h2 className="text-xl font-bold uppercase tracking-wider text-danger mb-4">
              Emergency Broadcast
            </h2>
            <p className="text-text-primary mb-6">{broadcast}</p>
            <button
              onClick={dismissBroadcast}
              className="px-6 py-3 border border-text-primary text-text-primary font-bold uppercase tracking-wider hover:bg-surface min-h-[44px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      </ErrorBoundary>
    </BrowserRouter>
  )
}
