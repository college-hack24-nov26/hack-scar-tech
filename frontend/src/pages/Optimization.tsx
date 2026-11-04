import { useState } from 'react'
import type { ShelterConfig } from '../types/shelter'
import { calculateHeatLoss } from '../api/thermoshelter'
import { calculateUValue, type AssemblyInput } from '../api/materials'
import { predictHeatLoss } from '../api/ml'

interface OptimizationProps {
  shelter: ShelterConfig
  setShelter: React.Dispatch<React.SetStateAction<ShelterConfig>>
}

interface OptimizationResult {
  name: string
  surface: string
  material: string
  heatLoss: number
  mlHeatLoss: number
  config: ShelterConfig
}

interface AssemblyCandidate {
  surface: 'wall' | 'roof' | 'floor'
  label: string
  name: string
  layers: AssemblyInput['layers']
}

const climate = {
  location: 'Ladakh',
  outdoor_temperature_c: -10,
  wind_speed_m_s: 5,
  solar_radiation_w_m2: 300,
  humidity_percent: 40,
}

const candidates: AssemblyCandidate[] = [
  {
    surface: 'wall',
    label: 'Walls',
    name: 'Brick + Insulation + Wood',
    layers: [
      { material_id: 1, thickness_m: 0.15 },
      { material_id: 4, thickness_m: 0.05 },
      { material_id: 2, thickness_m: 0.02 },
    ],
  },
  {
    surface: 'wall',
    label: 'Walls',
    name: 'Brick Only',
    layers: [
      { material_id: 1, thickness_m: 0.15 },
    ],
  },
  {
    surface: 'roof',
    label: 'Roof',
    name: 'Concrete + Insulation + Wood',
    layers: [
      { material_id: 3, thickness_m: 0.12 },
      { material_id: 4, thickness_m: 0.08 },
      { material_id: 2, thickness_m: 0.02 },
    ],
  },
  {
    surface: 'roof',
    label: 'Roof',
    name: 'Concrete Only',
    layers: [
      { material_id: 3, thickness_m: 0.12 },
    ],
  },
  {
    surface: 'floor',
    label: 'Floor',
    name: 'Concrete + Insulation',
    layers: [
      { material_id: 3, thickness_m: 0.12 },
      { material_id: 4, thickness_m: 0.05 },
    ],
  },
  {
    surface: 'floor',
    label: 'Floor',
    name: 'Concrete Only',
    layers: [
      { material_id: 3, thickness_m: 0.12 },
    ],
  },
]


export default function Optimization({
  shelter,
  setShelter,
}: OptimizationProps) {
  const [results, setResults] = useState<OptimizationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [baseline, setBaseline] = useState<number | null>(null)
  const [applied, setApplied] = useState(false)
  const [appliedHeatLoss, setAppliedHeatLoss] = useState<number | null>(null)

  const runOptimization = async () => {
    setLoading(true)
    setError('')
    setResults([])
    setBaseline(null)
    setApplied(false)

    try {
      const currentResult = await calculateHeatLoss(shelter, climate)

      const currentHeatLoss =
        currentResult.thermal_analysis.total_heat_loss_w

      setBaseline(currentHeatLoss)

      const evaluations: OptimizationResult[] = []

      for (const candidate of candidates) {
        const assemblyResult = await calculateUValue({
          surface: candidate.surface,
          layers: candidate.layers,
        })

        const uValueKey = `${candidate.surface}_u_value` as
          | 'wall_u_value'
          | 'roof_u_value'
          | 'floor_u_value'

        const config: ShelterConfig = {
          ...shelter,
          [uValueKey]: assemblyResult.u_value,
        }

        // Physics-based calculation
        const physicsResult = await calculateHeatLoss(config, climate)

        const physicsHeatLoss =
          physicsResult.thermal_analysis.total_heat_loss_w

        // ML prediction
        const mlResult = await predictHeatLoss({
          shelter: {
            length_m: config.length_m,
            width_m: config.width_m,
            height_m: config.height_m,
            wall_u_value: config.wall_u_value,
            roof_u_value: config.roof_u_value,
            floor_u_value: config.floor_u_value,
            window_area_m2: config.window_area_m2,
            door_area_m2: config.door_area_m2,
          },
          climate,
        })

        evaluations.push({
          name: `${candidate.label} — ${candidate.name}`,
          surface: candidate.label,
          material: candidate.name,
          heatLoss: physicsHeatLoss,
          mlHeatLoss: mlResult.predictions.total_heat_loss_w,
          config,
        })
      }

      // Physics engine remains the ranking source.
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

  const applyBestConfiguration = async () => {
  if (!bestResult) return

  try {
    setError('')
    setShelter({ ...bestResult.config })
    setApplied(true)

    const updatedResult = await calculateHeatLoss(
      bestResult.config,
      climate
    )

    setAppliedHeatLoss(
      updatedResult.thermal_analysis.total_heat_loss_w
    )
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Failed to apply configuration.'
    )
  }
}

  const improvement =
    baseline !== null && bestResult && baseline > 0
      ? ((baseline - bestResult.heatLoss) / baseline) * 100
      : 0

  return (
    <div className="dashboard-content">
      <div className="page-heading">
        <div>
          <div className="eyebrow">DESIGN OPTIMIZATION</div>
          <h1>Shelter Optimization</h1>
          <p>
            Compare material assemblies using physics-based
            simulation and machine learning predictions.
          </p>
        </div>
      </div>

      <div
        className="panel"
        style={{ padding: '24px', marginBottom: '24px' }}
      >
        <div className="panel-heading">
          <div>
            <h3>Optimization Engine</h3>
            <p>
              Evaluate alternative wall, roof, and floor assemblies.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginTop: '20px',
          }}
        >
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
            {loading
              ? 'Evaluating configurations...'
              : 'Run Optimization'}
          </button>
        </div>

        {loading && (
          <p style={{ marginTop: '18px', color: '#38bdf8' }}>
            Evaluating six configurations using both prediction engines...
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
              <span style={{ color: '#94a3b8' }}>
                Current heat loss
              </span>
              <h2 style={{ marginTop: '12px' }}>
                {(baseline / 1000).toFixed(3)} kW
              </h2>
            </div>

            <div className="panel" style={{ padding: '20px' }}>
              <span style={{ color: '#94a3b8' }}>
                Best physics estimate
              </span>
              <h2 style={{ marginTop: '12px', color: '#38bdf8' }}>
                {(bestResult.heatLoss / 1000).toFixed(3)} kW
              </h2>
            </div>

            <div className="panel" style={{ padding: '20px' }}>
              <span style={{ color: '#94a3b8' }}>
                Estimated improvement
              </span>
              <h2
                style={{
                  marginTop: '12px',
                  color: improvement > 0 ? '#4ade80' : '#f87171',
                }}
              >
                {improvement.toFixed(1)}%
              </h2>
            </div>
          </section>

          <div
            className="panel"
            style={{ padding: '24px', marginTop: '24px' }}
          >
            <div className="panel-heading">
              <div>
                <h3>Best Performing Configuration</h3>
                <p>
                  Lowest estimated heat loss according to the physics engine.
                </p>
              </div>
            </div>

            <h2 style={{ marginTop: '20px', color: '#38bdf8' }}>
              {bestResult.name}
            </h2>

            <p style={{ color: '#94a3b8', marginTop: '8px' }}>
              Assembly: {bestResult.material}
            </p>

            <div style={{ marginTop: '16px' }}>
              <p>
                Physics prediction:{' '}
                <strong>{bestResult.heatLoss.toFixed(2)} W</strong>
              </p>
              <p style={{ marginTop: '8px' }}>
                ML prediction:{' '}
                <strong>{bestResult.mlHeatLoss.toFixed(2)} W</strong>
              </p>
            </div>

            <button
            className="period-button"
            style={{ marginTop: '20px' }}
            onClick={applyBestConfiguration}
            disabled={applied}
          >
            {applied
              ? 'Configuration Applied ✓'
              : 'Apply Best Configuration'}
          </button>
          {applied && (
  <div
    style={{
      marginTop: '20px',
      padding: '16px',
      borderRadius: '10px',
      background: '#12352b',
      border: '1px solid #22c55e',
    }}
  >
    <h4 style={{ color: '#4ade80' }}>
      Configuration Applied Successfully
    </h4>

    <p style={{ marginTop: '8px' }}>
      Wall U-value: {shelter.wall_u_value.toFixed(3)} W/m²K
    </p>

    <p>
      Roof U-value: {shelter.roof_u_value.toFixed(3)} W/m²K
    </p>

    <p>
      Floor U-value: {shelter.floor_u_value.toFixed(3)} W/m²K
    </p>
  </div>
)}
          </div>
          {applied && appliedHeatLoss !== null && (
  <div className="panel" style={{ padding: '20px', marginTop: '20px' }}>
    <h3 style={{ color: '#4ade80' }}>
      Updated Shelter Performance
    </h3>

    <p style={{ marginTop: '12px' }}>
      Original heat loss: {baseline?.toFixed(2)} W
    </p>

    <p>
      Updated heat loss: {appliedHeatLoss.toFixed(2)} W
    </p>

    <p>
      Estimated reduction:{' '}
      {baseline !== null && baseline > 0
        ? `${(((baseline - appliedHeatLoss) / baseline) * 100).toFixed(2)}%`
        : '—'}
    </p>
  </div>
)}

          <div
            className="panel"
            style={{ padding: '24px', marginTop: '24px' }}
          >
            <h3>Physics vs ML Comparison</h3>

            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  textAlign: 'left',
                  minWidth: '650px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      color: '#94a3b8',
                      borderBottom: '1px solid #334155',
                    }}
                  >
                    <th style={{ padding: '12px' }}>Rank</th>
                    <th style={{ padding: '12px' }}>Surface</th>
                    <th style={{ padding: '12px' }}>Assembly</th>
                    <th style={{ padding: '12px' }}>Physics (W)</th>
                    <th style={{ padding: '12px' }}>ML (W)</th>
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
                        {result.heatLoss.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px', color: '#38bdf8' }}>
                        {result.mlHeatLoss.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p
            style={{
              color: '#94a3b8',
              fontSize: '12px',
              marginTop: '16px',
            }}
          >
            The physics engine determines the ranking. ML predictions
            are generated using a model trained on synthetic thermal
            simulation data and are not validated real-world measurements.
            Material costs and thermal comfort are not included.
          </p>
        </>
      )}
    </div>
  )
}