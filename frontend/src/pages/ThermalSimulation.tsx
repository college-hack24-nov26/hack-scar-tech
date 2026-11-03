import { useState } from 'react'
import {
BarChart,
Bar,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer,
} from 'recharts'

import {
calculateHeatLoss,
} from '../api/thermoshelter'

import type {
ClimateInput,
HeatLossResponse,
} from '../api/thermoshelter'

import type { ShelterConfig } from '../types/shelter'

interface ThermalSimulationProps {
shelter: ShelterConfig
}

const initialClimate: ClimateInput = {
location: 'Ladakh',
outdoor_temperature_c: -10,
wind_speed_m_s: 5,
solar_radiation_w_m2: 300,
humidity_percent: 40,
}

export default function ThermalSimulation({
shelter,
}: ThermalSimulationProps) {
const [climate, setClimate] = useState<ClimateInput>(initialClimate)
const [result, setResult] = useState<HeatLossResponse | null>(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const updateClimate = (
field: keyof ClimateInput,
value: string
) => {
setClimate((previous) => ({
...previous,
[field]: field === 'location' ? value : Number(value),
}))
}

const runSimulation = async () => {
setLoading(true)
setError('')


try {
  const simulationResult = await calculateHeatLoss(shelter, climate)
  setResult(simulationResult)
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : 'Unable to run the simulation.'
  )
} finally {
  setLoading(false)
}


}

const chartData = result
? [
{
surface: 'Walls',
heatLoss: result.thermal_analysis.wall_heat_loss_w,
},
{
surface: 'Roof',
heatLoss: result.thermal_analysis.roof_heat_loss_w,
},
{
surface: 'Floor',
heatLoss: result.thermal_analysis.floor_heat_loss_w,
},
]
: []

const inputStyle: React.CSSProperties = {
width: '100%',
padding: '11px 12px',
marginTop: '8px',
background: '#0b1727',
border: '1px solid #334155',
borderRadius: '8px',
color: '#ffffff',
boxSizing: 'border-box',
}

const fields: {
key: keyof ClimateInput
label: string
unit: string
min?: number
max?: number
}[] = [
{
key: 'outdoor_temperature_c',
label: 'Outdoor Temperature',
unit: '°C',
min: -60,
max: 60,
},
{
key: 'wind_speed_m_s',
label: 'Wind Speed',
unit: 'm/s',
min: 0,
max: 100,
},
{
key: 'solar_radiation_w_m2',
label: 'Solar Radiation',
unit: 'W/m²',
min: 0,
max: 1500,
},
{
key: 'humidity_percent',
label: 'Humidity',
unit: '%',
min: 0,
max: 100,
},
]

return ( <div className="dashboard-content"> <div className="page-heading"> <div> <div className="eyebrow">THERMAL ANALYSIS</div> <h1>Thermal Simulation</h1> <p>
Evaluate estimated shelter heat loss under different climate conditions. </p> </div> </div>


  <div
    className="panel"
    style={{ padding: '24px', marginBottom: '24px' }}
  >
    <h3>Climate Configuration</h3>
    <p style={{ color: '#94a3b8', marginTop: '8px' }}>
      Enter the environmental conditions for your simulation.
    </p>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '20px',
        marginTop: '24px',
      }}
    >
      <div>
        <label>Location</label>
        <input
          type="text"
          value={climate.location}
          onChange={(e) => updateClimate('location', e.target.value)}
          style={inputStyle}
        />
      </div>

      {fields.map((field) => (
        <div key={field.key}>
          <label>
            {field.label} ({field.unit})
          </label>
          <input
            type="number"
            value={climate[field.key] as number}
            min={field.min}
            max={field.max}
            onChange={(e) => updateClimate(field.key, e.target.value)}
            style={inputStyle}
          />
        </div>
      ))}
    </div>

    <button
      className="period-button"
      onClick={runSimulation}
      disabled={loading}
      style={{ marginTop: '24px', minWidth: '170px' }}
    >
      {loading ? 'Running Simulation...' : 'Run Simulation'}
    </button>

    {error && (
      <p style={{ color: '#f87171', marginTop: '16px' }}>
        {error}
      </p>
    )}
  </div>

  {result && (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="panel" style={{ padding: '20px' }}>
          <p style={{ color: '#94a3b8' }}>Total Heat Loss</p>
          <h2 style={{ marginTop: '10px', color: '#38bdf8' }}>
            {result.thermal_analysis.total_heat_loss_w.toFixed(2)} W
          </h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <p style={{ color: '#94a3b8' }}>Indoor Temperature</p>
          <h2 style={{ marginTop: '10px' }}>
            {result.indoor_temperature_c} °C
          </h2>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <p style={{ color: '#94a3b8' }}>Outdoor Temperature</p>
          <h2 style={{ marginTop: '10px' }}>
            {result.outdoor_temperature_c} °C
          </h2>
        </div>
      </div>

      <div
        className="panel"
        style={{ padding: '24px', marginBottom: '24px' }}
      >
        <h3>Heat Loss by Surface</h3>
        <p style={{ color: '#94a3b8', marginTop: '8px' }}>
          Estimated heat loss through each building surface.
        </p>

        <div style={{ width: '100%', height: '320px', marginTop: '20px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="surface" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  background: '#111d2e',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                formatter={(value) => [
                  `${Number(value).toFixed(2)} W`,
                  'Heat Loss',
                ]}
              />
              <Bar
                dataKey="heatLoss"
                fill="#0ea5e9"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <h3>Simulation Details</h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          <div>
            <p style={{ color: '#94a3b8' }}>Wall Heat Loss</p>
            <h3>{result.thermal_analysis.wall_heat_loss_w.toFixed(2)} W</h3>
          </div>

          <div>
            <p style={{ color: '#94a3b8' }}>Roof Heat Loss</p>
            <h3>{result.thermal_analysis.roof_heat_loss_w.toFixed(2)} W</h3>
          </div>

          <div>
            <p style={{ color: '#94a3b8' }}>Floor Heat Loss</p>
            <h3>{result.thermal_analysis.floor_heat_loss_w.toFixed(2)} W</h3>
          </div>
        </div>

        <p style={{ color: '#94a3b8', marginTop: '24px', fontSize: '13px' }}>
          Model limitation: This is a simplified steady-state heat-transfer
          estimate. Wind speed, solar radiation and humidity are accepted
          as inputs but are not currently included in the backend heat-loss
          calculation. The model does not predict indoor temperature changes
          over time.
        </p>
      </div>
    </>
  )}
</div>


)
}
