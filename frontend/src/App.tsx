import { useState, lazy, Suspense } from 'react'
import Sidebar from './components/Sidebar'
import type { PageId } from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import { defaultShelterConfig } from './types/shelter'
import type { ShelterConfig } from './types/shelter'
import './App.css'
import Optimization from './pages/Optimization'
import ThermalSimulation from './pages/ThermalSimulation'
import Reports from './pages/Reports'

const ShelterViewer = lazy(() => import('./components/ShelterViewer'))

const DEMO_EMAIL = 'demo@thermoshelter.ai'
const DEMO_PASSWORD = 'Thermo@123'

function App() {
  const [shelter, setShelter] = useState<ShelterConfig>(
    defaultShelterConfig
  )

  const [activePage, setActivePage] = useState<PageId>('Dashboard')

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('thermoshelter_logged_in') === 'true'
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      localStorage.setItem('thermoshelter_logged_in', 'true')
      setIsLoggedIn(true)
      setError('')
    } else {
      setError('Invalid email or password.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('thermoshelter_logged_in')
    setIsLoggedIn(false)
    setEmail('')
    setPassword('')
    setActivePage('Dashboard')
  }

  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#080f1d',
        padding: '20px'
      }}>
        <form
          onSubmit={handleLogin}
          style={{
            width: '100%',
            maxWidth: '420px',
            padding: '36px',
            background: '#111d2e',
            border: '1px solid #293b51',
            borderRadius: '16px',
            color: '#ffffff'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '27px', marginBottom: '8px' }}>
              ThermoShelter AI
            </h1>
            <p style={{ color: '#94a3b8' }}>
              Sign in to your design platform
            </p>
          </div>

          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{
              width: '100%',
              padding: '13px',
              margin: '10px 0 20px',
              background: '#080f1d',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: 'white',
              boxSizing: 'border-box'
            }}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{
              width: '100%',
              padding: '13px',
              margin: '10px 0 20px',
              background: '#080f1d',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: 'white',
              boxSizing: 'border-box'
            }}
          />

          {error && (
            <p style={{ color: '#f87171', marginBottom: '15px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>

          <div style={{
            marginTop: '25px',
            padding: '14px',
            background: '#080f1d',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#94a3b8'
          }}>
            <strong style={{ color: '#38bdf8' }}>Demo Credentials</strong>
            <p>Email: {DEMO_EMAIL}</p>
            <p>Password: {DEMO_PASSWORD}</p>
          </div>
        </form>
      </div>
    )
  }

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return (
          <Dashboard
            shelter={shelter}
            setShelter={setShelter}
          />
        )

      case 'Shelter Designer':
        return (
          <div className="dashboard-content">
            <div className="page-heading">
              <div>
                <div className="eyebrow">DESIGN WORKSPACE</div>
                <h1>Shelter Designer</h1>
                <p>Configure and visualize your shelter design.</p>
              </div>
            </div>

            <Suspense fallback={<div className="panel">Loading 3D Shelter Viewer...</div>}>
              <ShelterViewer
                shelter={shelter}
                setShelter={setShelter}
              />
            </Suspense>
          </div>
        )

      case 'Thermal Simulation':
        return (
          <ThermalSimulation shelter={shelter} />
        )

      case 'Optimization':
  return (
    <Optimization
      shelter={shelter}
      setShelter={setShelter}
    />
  )

case 'Reports':
  return<Reports shelter={shelter}/>
 
        
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <main className="main-area">
        <Header />

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '8px 24px'
        }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '9px 18px',
              background: '#17283d',
              color: '#38bdf8',
              border: '1px solid #334155',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>

        {renderPage()}
      </main>
    </div>
  )
}

export default App