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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import StatCard from '../components/StatCard'
import { lazy, Suspense, useState } from 'react'
import {
  calculateHeatLoss,
  type HeatLossResponse,
} from '../api/thermoshelter'

const ShelterViewer = lazy(
  () => import('../components/ShelterViewer')
)
import type { ShelterConfig } from '../types/shelter'
import type { Dispatch, SetStateAction } from 'react'


interface DashboardProps {
  shelter: ShelterConfig
  setShelter: Dispatch<SetStateAction<ShelterConfig>>
}
export default function Dashboard({shelter, setShelter}: DashboardProps) {
    const [simulation, setSimulation] = useState<HeatLossResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runSimulation = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await calculateHeatLoss(shelter, {
        location: 'Ladakh',
        outdoor_temperature_c: -10,
        wind_speed_m_s: 5,
        solar_radiation_w_m2: 300,
        humidity_percent: 40,
      })

      setSimulation(result)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Simulation failed'
      )
    } finally {
      setLoading(false)
    }
  }
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
      <section className="panel" style={{ marginBottom: '24px', padding: '20px' }}>
  <div className="panel-heading">
    <div>
      <h3>Thermal Simulation</h3>
      <p>Calculate heat loss using your current shelter configuration.</p>
    </div>


<button
  onClick={runSimulation}
  disabled={loading}
  className="period-button"
>
  {loading ? 'Calculating...' : 'Run Simulation'}
</button>


  </div>

{error && (
<p style={{ color: '#ef4444', marginTop: '12px' }}>
{error} </p>
)}

{simulation && (
<div style={{ marginTop: '16px' }}> <h3>Simulation Completed</h3> <p>
Total Heat Loss:{' '} <strong>
{(simulation.thermal_analysis.total_heat_loss_w / 1000).toFixed(3)} kW </strong> </p> <p>
Walls: {simulation.thermal_analysis.wall_heat_loss_w} W
{' | '}
Roof: {simulation.thermal_analysis.roof_heat_loss_w} W
{' | '}
Floor: {simulation.thermal_analysis.floor_heat_loss_w} W </p> </div>
)}

</section>


      <section className="stats-grid">
        <StatCard
          title="Indoor Temperature"
          value={simulation ? simulation.indoor_temperature_c.toFixed(1) : '--'}
          unit="°C"
          description="Fixed simulation assumption, not a prediction"
          icon={Thermometer}
          color="blue"
        />

        <StatCard
          title="Heat Loss"
          value={
            simulation
              ? (simulation.thermal_analysis.total_heat_loss_w / 1000).toFixed(3)
              : '--'
          }
          unit="kW"
          description="Calculated transmission heat loss"
          icon={TrendingDown}
          color="orange"
        />

        <StatCard
  title="Estimated Cost"
  value="--"
  unit=""
  description="Not yet calculated"
  icon={Wallet}
  color="green"
/>

<StatCard
  title="Thermal Efficiency"
  value="--"
  unit=""
  description="Not yet calculated"
  icon={Activity}
  color="purple"
/>
      </section>

      <section className="main-grid">
        <div className="panel temperature-panel">
  <div className="panel-heading">
    <div>
      <h3>Heat Loss Breakdown</h3>
      <p>
        {simulation
          ? 'Calculated heat loss by shelter component'
          : 'Run a simulation to view heat loss'}
      </p>
    </div>
  </div>

  {simulation ? (
    <>
      <div className="chart-legend">
        <span>
          <i className="legend-indoor" />
          Heat Loss (Watts)
        </span>
      </div>

      <div className="temperature-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[
              {
                component: 'Walls',
                heatLoss: simulation.thermal_analysis.wall_heat_loss_w,
              },
              {
                component: 'Roof',
                heatLoss: simulation.thermal_analysis.roof_heat_loss_w,
              },
              {
                component: 'Floor',
                heatLoss: simulation.thermal_analysis.floor_heat_loss_w,
              },
            ]}
          >
            <CartesianGrid
              stroke="#263448"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="component"
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
              unit=" W"
            />

            <Tooltip
              contentStyle={{
                background: '#111d2e',
                border: '1px solid #293b51',
                borderRadius: '10px',
                color: '#fff',
              }}
              formatter={(value) => [`${value} W`, 'Heat Loss']}
            />

            <Bar
              dataKey="heatLoss"
              fill="#35b7e8"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  ) : (
    <div style={{ padding: '40px 10px', textAlign: 'center' }}>
      <p>Simulation results will appear here.</p>
      <p style={{ color: '#8291a7', fontSize: '13px' }}>
        Configure your shelter and click Run Simulation.
      </p>
    </div>
  )}
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
              <strong>{simulation ? `${simulation.outdoor_temperature_c}°C` : '--'}</strong>
            </div>
            <ArrowDownRight className="orange-text" size={18} />
          </div>

          <div className="environment-item">
            <div className="environment-icon orange">
              <Wind size={19} />
            </div>
            <div>
              <span>Wind Speed</span>
              <strong>
                {
                simulation
                ? `${(simulation.wind_speed_m_s * 3.6).toFixed(1)} km/h`
                : '--'}
              </strong>
            </div>
            <ArrowUpRight className="muted-icon" size={18} />
          </div>

          <div className="environment-item">
            <div className="environment-icon yellow">
              <Sun size={19} />
            </div>
            <div>
              <span>Solar Radiation</span>
              <strong>
                {simulation
                ? `${simulation.solar_radiation_w_m2} W/m²`
                : '--'}
              </strong>
            </div>
            <ArrowUpRight className="muted-icon" size={18} />
          </div>
          <div className="environment-item">
  <div className="environment-icon blue">
    <Activity size={19} />
  </div>
  <div>
    <span>Humidity</span>
    <strong>
      {simulation ? `${simulation.humidity_percent}%` : '--'}
    </strong>
  </div>
</div>

          <div className="environment-note">
            <span className="note-dot" />
            {simulation
  ? 'Climate inputs used for thermal simulation.'
  : 'Run a simulation to view climate inputs.'}
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
    <strong>
      {loading
        ? 'Simulation in progress'
        : error
          ? 'Simulation failed'
          : simulation
            ? 'Simulation completed'
            : 'Awaiting simulation'}
    </strong>

    <p>
      {loading
        ? 'Calculating heat loss for the current shelter configuration...'
        : error
          ? error
          : simulation
            ? `Thermal analysis completed successfully.`
            : 'Configure your shelter and click Run Simulation to begin.'}
    </p>
  </div>
</div>

          
            
            
          
          <div className="activity-footer">
  <span>Simulation engine</span>
  <span className="pending-label">
    {loading ? 'Processing' : simulation ? 'Connected' : error ? 'Error' : 'Ready'}
  </span>
</div>
        </div>
      </section>
    </div>
  )
}