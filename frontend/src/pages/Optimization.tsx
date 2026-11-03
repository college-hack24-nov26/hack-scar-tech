import { useState } from 'react'
import type { ShelterConfig } from '../types/shelter'
import { calculateHeatLoss } from '../api/thermoshelter'
import { getMaterials } from '../api/materials'


interface OptimizationProps {
  shelter: ShelterConfig
  setShelter: React.Dispatch<React.SetStateAction<ShelterConfig>>
}

interface OptimizationResult {
  name: string
  surface: string
  material: string
  heatLoss: number
  config: ShelterConfig
}

const climate = {
  location: 'Ladakh',
  outdoor_temperature_c: -10,
  wind_speed_m_s: 5,
  solar_radiation_w_m2: 300,
  humidity_percent: 40,
}

const surfaces = [
  { key: 'wall_u_value', label: 'Walls' },
  { key: 'roof_u_value', label: 'Roof' },
  { key: 'floor_u_value', label: 'Floor' },
] as const

export default function Optimization({
  shelter,
  setShelter,
}: OptimizationProps) {
  const [results, setResults] = useState<OptimizationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [baseline, setBaseline] = useState<number | null>(null)
  

  const runOptimization = async () => {
    setLoading(true)
    setError('')
    setResults([])
    setBaseline(null)

    try {
      const availableMaterials = await getMaterials()

      if (!availableMaterials.length) {
        throw new Error('No materials found in the material catalogue.')
      }

      

      const currentResult = await calculateHeatLoss(shelter, climate)

      setBaseline(currentResult.thermal_analysis.total_heat_loss_w)

      const evaluations: OptimizationResult[] = []

      for (const surface of surfaces) {
        for (const material of availableMaterials) {
          const config: ShelterConfig = {
            ...shelter,
            [surface.key]: material.thermal_conductivity / 0.15,
          }

          const result = await calculateHeatLoss(config, climate)

          evaluations.push({
            name: `${surface.label} — ${material.name}`,
            surface: surface.label,
            material: material.name,
            heatLoss: result.thermal_analysis.total_heat_loss_w,
            config,
          })
        }
      }

      evaluations.sort((a, b) => a.heatLoss - b.heatLoss)

      setResults(evaluations)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Optimization failed.'
      )
    } finally {
      setLoading(false)
    }
  }

  const bestResult = results[0]

  const applyBestConfiguration = () => {
    if (!bestResult) return
    setShelter(bestResult.config)
  }

  const improvement =
    baseline !== null && bestResult
      ? ((baseline - bestResult.heatLoss) / baseline) * 100
      : 0

  return (
    <div className="dashboard-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">DESIGN OPTIMIZATION</div>
          <h1>Shelter Optimization</h1>
          <p>
            Compare material alternatives and identify configurations
            with lower estimated heat loss.
          </p>
        </div>
      </div>

      <div className="panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div className="panel-heading">
          <div>
            <h3>Optimization Engine</h3>
            <p>
              Evaluate alternative wall, roof, and floor materials.
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginTop: '20px'
        }}>
          <div>
            <strong>Current shelter</strong>
            <p style={{ color: '#94a3b8', marginTop: '6px' }}>
              {shelter.length_m}m × {shelter.width_m}m × {shelter.height_m}m
            </p>
          </div>

          <button
            className="period-button"
            onClick={runOptimization}
            disabled={loading}
          >
            {loading ? 'Evaluating configurations...' : 'Run Optimization'}
          </button>
        </div>

        {loading && (
          <p style={{ marginTop: '18px', color: '#38bdf8' }}>
            Evaluating material combinations. Please wait...
          </p>
        )}

        {error && (
          <p style={{ color: '#f87171', marginTop: '18px' }}>
            {error}
          </p>
        )}
      </div>

      {results.length > 0 && baseline !== null && (
        <>
          <section className="stats-grid">
            <div className="panel" style={{ padding: '20px' }}>
              <span style={{ color: '#94a3b8' }}>Current heat loss</span>
              <h2 style={{ marginTop: '12px' }}>
                {(baseline / 1000).toFixed(3)} kW
              </h2>
            </div>

            <div className="panel" style={{ padding: '20px' }}>
              <span style={{ color: '#94a3b8' }}>Best estimated heat loss</span>
              <h2 style={{ marginTop: '12px', color: '#38bdf8' }}>
                {(bestResult.heatLoss / 1000).toFixed(3)} kW
              </h2>
            </div>

            <div className="panel" style={{ padding: '20px' }}>
              <span style={{ color: '#94a3b8' }}>Estimated improvement</span>
              <h2 style={{
                marginTop: '12px',
                color: improvement > 0 ? '#4ade80' : '#f87171'
              }}>
                {improvement.toFixed(1)}%
              </h2>
            </div>
          </section>

          <div className="panel" style={{ padding: '24px', marginTop: '24px' }}>
            <div className="panel-heading">
              <div>
                <h3>Best Performing Configuration</h3>
                <p>Lowest estimated heat loss among evaluated alternatives.</p>
              </div>
            </div>

            <h2 style={{ marginTop: '20px', color: '#38bdf8' }}>
              {bestResult.name}
            </h2>

            <p style={{ color: '#94a3b8', marginTop: '8px' }}>
              Material: {bestResult.material}
            </p>

            <button
              className="period-button"
              style={{ marginTop: '20px' }}
              onClick={applyBestConfiguration}
            >
              Apply Best Configuration
            </button>
          </div>

          <div className="panel" style={{ padding: '24px', marginTop: '24px' }}>
            <h3>Configuration Comparison</h3>

            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                minWidth: '500px'
              }}>
                <thead>
                  <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '12px' }}>Rank</th>
                    <th style={{ padding: '12px' }}>Surface</th>
                    <th style={{ padding: '12px' }}>Material</th>
                    <th style={{ padding: '12px' }}>Heat Loss</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={`${result.surface}-${result.material}`}
                      style={{ borderBottom: '1px solid #293b51' }}
                    >
                      <td style={{ padding: '12px' }}>
                        #{index + 1}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {result.surface}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {result.material}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {(result.heatLoss / 1000).toFixed(3)} kW
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p style={{
            color: '#94a3b8',
            fontSize: '12px',
            marginTop: '16px'
          }}>
            Results are estimates from the current steady-state heat-loss
            model. Each candidate changes one surface material at a time.
            The assumed material thickness is 0.15 m. Cost and thermal
            comfort are not included.
          </p>
        </>
      )}
    </div>
  )
}