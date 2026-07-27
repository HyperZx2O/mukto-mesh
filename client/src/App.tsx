import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { WsProvider } from '@/lib/ws'
import ErrorBoundary from '@/components/ErrorBoundary'
import PageSkeleton from '@/components/PageSkeleton'
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
  return (
    <BrowserRouter>
      <WsProvider>
        <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
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
        </ErrorBoundary>
      </WsProvider>
    </BrowserRouter>
  )
}
