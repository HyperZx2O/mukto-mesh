import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import Chat from '@/pages/Chat'
import Noticeboard from '@/pages/Noticeboard'
import KnowledgeBase from '@/pages/KnowledgeBase'
import CheckIn from '@/pages/CheckIn'
import MissingPersons from '@/pages/MissingPersons'
import News from '@/pages/News'
import Map from '@/pages/Map'
import Admin from '@/pages/Admin'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'

export default function App() {
  const isOffline = useOfflineStatus()

  return (
    <BrowserRouter>
      {isOffline && (
        <div className="bg-primary text-white text-center text-sm py-2 px-4">
          Offline mode — all features still available on this network
        </div>
      )}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/board" element={<Noticeboard />} />
        <Route path="/info/*" element={<KnowledgeBase />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/missing" element={<MissingPersons />} />
        <Route path="/news" element={<News />} />
        <Route path="/map" element={<Map />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
