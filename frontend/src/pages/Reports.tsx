import { useState } from 'react'
import type { ShelterConfig } from '../types/shelter'
import { calculateHeatLoss } from '../api/thermoshelter'
import { getMaterials } from '../api/materials'
import { predictHeatLoss } from '../api/ml'

interface ReportsProps {
  shelter: ShelterConfig
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

interface ReportData {
  generatedAt: string
  totalHeatLoss: number
  wallHeatLoss: number
  roofHeatLoss: number
  floorHeatLoss: number
  mlWallHeatLoss: number
  mlRoofHeatLoss: number
  mlFloorHeatLoss: number
  mlTotalHeatLoss: number
  bestMaterial: string
  bestSurface: string
  bestHeatLoss: number
  improvement: number
  modelName: string
  mlNotice: string
}

export default function Reports({ shelter }: ReportsProps) {
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateReport = async () => {
    setLoading(true)
    setError('')
    setReport(null)

    try {
      // Physics-based analysis
      const baseline = await calculateHeatLoss(shelter, climate)

      // ML prediction
      const mlResult = await predictHeatLoss({
        shelter: {
          length_m: shelter.length_m,
          width_m: shelter.width_m,
          height_m: shelter.height_m,
          wall_u_value: shelter.wall_u_value,
          roof_u_value: shelter.roof_u_value,
          floor_u_value: shelter.floor_u_value,
          window_area_m2: shelter.window_area_m2,
          door_area_m2: shelter.door_area_m2,
        },
        climate,
      })

      const materials = await getMaterials()

      if (!materials.length) {
        throw new Error('No materials found in the catalogue.')
      }

      let bestHeatLoss =
        baseline.thermal_analysis.total_heat_loss_w

      let bestMaterial = 'Current configuration'
      let bestSurface = 'Unchanged'

      for (const surface of surfaces) {
        for (const material of materials) {
          const candidate: ShelterConfig = {
            ...shelter,
            [surface.key]: material.thermal_conductivity / 0.15,
          }

          const result = await calculateHeatLoss(candidate, climate)
          const heatLoss =
            result.thermal_analysis.total_heat_loss_w

          if (heatLoss < bestHeatLoss) {
            bestHeatLoss = heatLoss
            bestMaterial = material.name
            bestSurface = surface.label
          }
        }
      }

      const total =
        baseline.thermal_analysis.total_heat_loss_w

      setReport({
        generatedAt: new Date().toLocaleString(),

        totalHeatLoss: total,
        wallHeatLoss:
          baseline.thermal_analysis.wall_heat_loss_w,
        roofHeatLoss:
          baseline.thermal_analysis.roof_heat_loss_w,
        floorHeatLoss:
          baseline.thermal_analysis.floor_heat_loss_w,

        mlWallHeatLoss:
          mlResult.predictions.wall_heat_loss_w,
        mlRoofHeatLoss:
          mlResult.predictions.roof_heat_loss_w,
        mlFloorHeatLoss:
          mlResult.predictions.floor_heat_loss_w,
        mlTotalHeatLoss:
          mlResult.predictions.total_heat_loss_w,

        bestMaterial,
        bestSurface,
        bestHeatLoss,

        improvement:
          total > 0
            ? ((total - bestHeatLoss) / total) * 100
            : 0,

        modelName: mlResult.model_name,
        mlNotice: mlResult.notice,
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate report.'
      )
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    window.print()
  }

  return (
    <div className="dashboard-content">
      <div className="page-heading no-print">
        <div>
          <div className="eyebrow">PROJECT DOCUMENTATION</div>
          <h1>Thermal Performance Reports</h1>
          <p>
            Generate a shelter performance report with physics-based
            thermal analysis, ML predictions, and material recommendations.
          </p>
        </div>
      </div>

      <div
        className="panel no-print"
        style={{ padding: '24px' }}
      >
        <h3>Report Configuration</h3>

        <p style={{ color: '#94a3b8', marginTop: '10px' }}>
          Current shelter: {shelter.length_m}m × {shelter.width_m}m ×
          {' '}{shelter.height_m}m
        </p>

        <p style={{ color: '#94a3b8', marginTop: '8px' }}>
          Climate: Ladakh, {climate.outdoor_temperature_c}°C outdoor temperature.
        </p>

        <button
          className="period-button"
          onClick={generateReport}
          disabled={loading}
          style={{ marginTop: '22px' }}
        >
          {loading ? 'Generating Report...' : 'Generate Report'}
        </button>

        {loading && (
          <p style={{ color: '#38bdf8', marginTop: '15px' }}>
            Running thermal analysis, ML prediction, and material evaluation...
          </p>
        )}

        {error && (
          <p style={{ color: '#f87171', marginTop: '15px' }}>
            {error}
          </p>
        )}
      </div>

      {report && (
        <>
          <div
            className="panel report-document"
            style={{ padding: '32px', marginTop: '24px' }}
          >
            <div className="report-header">
              <div>
                <h1>ThermoShelter AI</h1>
                <p>Thermal Performance Report</p>
              </div>

              <div>
                <strong>Generated:</strong>
                <p>{report.generatedAt}</p>
              </div>
            </div>

            <hr />

            <h2>1. Shelter Configuration</h2>

            <div className="report-grid">
              <p><strong>Length:</strong> {shelter.length_m} m</p>
              <p><strong>Width:</strong> {shelter.width_m} m</p>
              <p><strong>Height:</strong> {shelter.height_m} m</p>
              <p><strong>Orientation:</strong> {shelter.orientation}</p>
              <p><strong>Wall U-value:</strong> {shelter.wall_u_value} W/m²K</p>
              <p><strong>Roof U-value:</strong> {shelter.roof_u_value} W/m²K</p>
              <p><strong>Floor U-value:</strong> {shelter.floor_u_value} W/m²K</p>
            </div>

            <hr />

            <h2>2. Climate Conditions</h2>

            <div className="report-grid">
              <p><strong>Location:</strong> {climate.location}</p>
              <p><strong>Outdoor temperature:</strong> {climate.outdoor_temperature_c}°C</p>
              <p><strong>Wind speed:</strong> {climate.wind_speed_m_s} m/s</p>
              <p><strong>Solar radiation:</strong> {climate.solar_radiation_w_m2} W/m²</p>
              <p><strong>Humidity:</strong> {climate.humidity_percent}%</p>
              <p><strong>Indoor temperature assumption:</strong> 20°C</p>
            </div>

            <hr />

            <h2>3. Physics-Based Thermal Performance</h2>

            <div className="report-grid">
              <div>
                <p>Wall heat loss</p>
                <h3>{report.wallHeatLoss.toFixed(2)} W</h3>
              </div>

              <div>
                <p>Roof heat loss</p>
                <h3>{report.roofHeatLoss.toFixed(2)} W</h3>
              </div>

              <div>
                <p>Floor heat loss</p>
                <h3>{report.floorHeatLoss.toFixed(2)} W</h3>
              </div>
            </div>

            <div className="report-total">
              <p>Total Physics-Based Heat Loss</p>
              <h1>{report.totalHeatLoss.toFixed(2)} W</h1>
              <h3>{(report.totalHeatLoss / 1000).toFixed(3)} kW</h3>
            </div>

            <hr />

            <h2>4. Machine Learning Predictions</h2>

            <p>
              <strong>Model:</strong> {report.modelName}
            </p>

            <div className="report-grid" style={{ marginTop: '16px' }}>
              <div>
                <p>ML Wall Prediction</p>
                <h3>{report.mlWallHeatLoss.toFixed(2)} W</h3>
              </div>

              <div>
                <p>ML Roof Prediction</p>
                <h3>{report.mlRoofHeatLoss.toFixed(2)} W</h3>
              </div>

              <div>
                <p>ML Floor Prediction</p>
                <h3>{report.mlFloorHeatLoss.toFixed(2)} W</h3>
              </div>
            </div>

            <div className="report-total">
              <p>ML Predicted Total Heat Loss</p>
              <h1>{report.mlTotalHeatLoss.toFixed(2)} W</h1>
              <h3>{(report.mlTotalHeatLoss / 1000).toFixed(3)} kW</h3>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '12px' }}>
              {report.mlNotice}
            </p>

            <hr />

            <h2>5. Material Optimization Analysis</h2>

            <p>
              Best evaluated alternative:{' '}
              <strong>{report.bestMaterial}</strong>
            </p>

            <p>
              Surface: <strong>{report.bestSurface}</strong>
            </p>

            <p>
              Best estimated heat loss:{' '}
              <strong>{report.bestHeatLoss.toFixed(2)} W</strong>
            </p>

            <p>
              Estimated improvement:{' '}
              <strong>{report.improvement.toFixed(2)}%</strong>
            </p>

            <hr />

            <h2>6. Model Limitations</h2>

            <ul>
              <li>Physics results use a simplified steady-state heat-transfer model.</li>
              <li>ML predictions use a model trained on synthetic thermal simulation data.</li>
              <li>ML predictions are not validated real-world measurements.</li>
              <li>Material comparisons change one surface at a time.</li>
              <li>Material thickness is assumed to be 0.15 metres in the report's material comparison.</li>
              <li>Wind, solar radiation and humidity are not included in the current heat-loss calculation.</li>
              <li>Windows and doors are not included in the reported surface heat-loss calculation.</li>
              <li>Construction cost and dynamic indoor temperature changes are not evaluated.</li>
            </ul>

            <div className="report-footer">
              <p>ThermoShelter AI — Smarter Shelter. Warmer Tomorrow.</p>
              <p>Generated using the ThermoShelter AI software prototype.</p>
            </div>
          </div>

          <div className="no-print" style={{ marginTop: '20px' }}>
            <button
              className="period-button"
              onClick={downloadPDF}
            >
              Download Report as PDF
            </button>
          </div>
        </>
      )}
    </div>
  )
}