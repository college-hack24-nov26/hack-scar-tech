import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import { defaultShelterConfig } from './types/shelter'
import type { ShelterConfig } from './types/shelter'
import './App.css'

function App() {
  const [shelter, setShelter] = useState<ShelterConfig>(
    defaultShelterConfig
  )

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-area">
        <Header />
        <Dashboard
          shelter={shelter}
          setShelter={setShelter}
        />
      </main>
    </div>
  )
}

export default App