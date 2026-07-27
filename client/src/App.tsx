import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WsProvider } from '@/lib/ws'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Chat from '@/pages/Chat'
import Noticeboard from '@/pages/Noticeboard'
import KnowledgeBase from '@/pages/KnowledgeBase'
import CheckIn from '@/pages/CheckIn'
import MissingPersons from '@/pages/MissingPersons'
import News from '@/pages/News'
import Map from '@/pages/Map'
import Admin from '@/pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <WsProvider>
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
      </WsProvider>
    </BrowserRouter>
  )
}
