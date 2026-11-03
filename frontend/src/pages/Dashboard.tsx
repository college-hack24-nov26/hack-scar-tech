import {
  Thermometer,
  TrendingDown,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Wind,
  Sun,
} from 'lucide-react'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import StatCard from '../components/StatCard'
import { lazy, Suspense } from 'react'

const ShelterViewer = lazy(
  () => import('../components/ShelterViewer')
)
import type { ShelterConfig } from '../types/shelter'
import type { Dispatch, SetStateAction } from 'react'

const temperatureData = [
  { time: '00:00', indoor: -8, outdoor: -18 },
  { time: '04:00', indoor: -6, outdoor: -20 },
  { time: '08:00', indoor: -2, outdoor: -14 },
  { time: '12:00', indoor: 5, outdoor: -5 },
  { time: '16:00', indoor: 8, outdoor: -3 },
  { time: '20:00', indoor: 2, outdoor: -10 },
  { time: '24:00', indoor: -3, outdoor: -16 },
]
interface DashboardProps {
  shelter: ShelterConfig
  setShelter: Dispatch<SetStateAction<ShelterConfig>>
}
export default function Dashboard({shelter, setShelter}: DashboardProps) {
  return (
    <div className="dashboard-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">OVERVIEW</div>
          <h1>Dashboard</h1>
          <p>Monitor your shelter performance and thermal efficiency.</p>
        </div>

        <div className="demo-badge">
          <span />
          DEMO DATA
        </div>
      </div>

      <section className="stats-grid">
        <StatCard
          title="Indoor Temperature"
          value="8.4"
          unit="°C"
          description="Illustrative predicted temperature"
          icon={Thermometer}
          color="blue"
        />

        <StatCard
          title="Heat Loss"
          value="2.8"
          unit="kW"
          description="Illustrative thermal load"
          icon={TrendingDown}
          color="orange"
        />

        <StatCard
          title="Estimated Cost"
          value="₹1.85"
          unit="L"
          description="Illustrative construction estimate"
          icon={Wallet}
          color="green"
        />

        <StatCard
          title="Thermal Efficiency"
          value="76"
          unit="%"
          description="Illustrative performance indicator"
          icon={Activity}
          color="purple"
        />
      </section>

      <section className="main-grid">
        <div className="panel temperature-panel">
          <div className="panel-heading">
            <div>
              <h3>Temperature Analysis</h3>
              <p>Illustrative indoor vs outdoor temperature</p>
            </div>

            <button className="period-button">
              24 Hours <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="chart-legend">
            <span><i className="legend-indoor" /> Indoor</span>
            <span><i className="legend-outdoor" /> Outdoor</span>
          </div>

          <div className="temperature-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={temperatureData}>
                <defs>
                  <linearGradient id="indoorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#35b7e8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#35b7e8" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="outdoorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#263448" strokeDasharray="4 4" />

                <XAxis
                  dataKey="time"
                  stroke="#8291a7"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  stroke="#8291a7"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  unit="°"
                />

                <Tooltip
                  contentStyle={{
                    background: '#111d2e',
                    border: '1px solid #293b51',
                    borderRadius: '10px',
                    color: '#fff',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="indoor"
                  stroke="#35b7e8"
                  fill="url(#indoorGradient)"
                  strokeWidth={2.5}
                />

                <Area
                  type="monotone"
                  dataKey="outdoor"
                  stroke="#f59e0b"
                  fill="url(#outdoorGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel environment-panel">
          <div className="panel-heading">
            <div>
              <h3>Environment</h3>
              <p>Design climate inputs</p>
            </div>
            <Wind size={19} className="muted-icon" />
          </div>

          <div className="environment-item">
            <div className="environment-icon blue">
              <Thermometer size={19} />
            </div>
            <div>
              <span>Outdoor Temperature</span>
              <strong>-18°C</strong>
            </div>
            <ArrowDownRight className="orange-text" size={18} />
          </div>

          <div className="environment-item">
            <div className="environment-icon orange">
              <Wind size={19} />
            </div>
            <div>
              <span>Wind Speed</span>
              <strong>12 km/h</strong>
            </div>
            <ArrowUpRight className="muted-icon" size={18} />
          </div>

          <div className="environment-item">
            <div className="environment-icon yellow">
              <Sun size={19} />
            </div>
            <div>
              <span>Solar Radiation</span>
              <strong>420 W/m²</strong>
            </div>
            <ArrowUpRight className="muted-icon" size={18} />
          </div>

          <div className="environment-note">
            <span className="note-dot" />
            Illustrative climate inputs — not live weather data.
          </div>
        </div>
      </section>
      <section className="viewer-section">
        <Suspense
  fallback={
    <div className="panel">
      Loading 3D Shelter Viewer...
    </div>
  }
>
  <ShelterViewer
    shelter={shelter}
    setShelter={setShelter}
  />
</Suspense>
      </section>
      <section className="bottom-grid">
        <div className="panel project-panel">
          <div className="panel-heading">
            <div>
              <h3>Current Shelter Project</h3>
              <p>Prototype configuration</p>
            </div>
            <span className="status-badge">DRAFT</span>
          </div>

          <div className="project-details">
            <div>
              <span>Project Name</span>
              <strong>Himalayan Eco Shelter</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>Ladakh, India</strong>
            </div>
            <div>
              <span>Dimensions</span>
              <strong>{shelter.length_m}m × {shelter.width_m}m × {shelter.height_m}m</strong>
            </div>
            <div>
              <span>Wall Material</span>
              <strong>Insulated Composite</strong>
            </div>
          </div>
        </div>

        <div className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h3>Simulation Status</h3>
              <p>Current project activity</p>
            </div>
            <Activity size={19} className="muted-icon" />
          </div>

          <div className="activity-content">
            <div className="activity-indicator" />
            <div>
              <strong>Awaiting simulation</strong>
              <p>Configure your shelter to begin thermal analysis.</p>
            </div>
          </div>

          <div className="activity-footer">
            <span>Simulation engine</span>
            <span className="pending-label">Not connected</span>
          </div>
        </div>
      </section>
    </div>
  )
}