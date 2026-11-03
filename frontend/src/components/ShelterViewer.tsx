import { useState, useEffect, useRef } from 'react'
import type { Mesh } from 'three'
import { useFrame } from '@react-three/fiber'
import type { Dispatch, SetStateAction } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment } from '@react-three/drei'
import { Eye, EyeOff, RotateCcw } from 'lucide-react'
import type { ShelterConfig } from '../types/shelter'
import { getMaterials, type Material } from '../api/materials'

interface ShelterModelProps {
  length: number
  width: number
  height: number
  cutaway: boolean
  wallColor: string
  roofColor: string
  floorColor: string
}

interface HeatParticleProps {
  start: [number, number, number]
  end: [number, number, number]
  offset: number
  speed?: number
}
function HeatFlow({
  length,
  width,
  height,
}: {
  length: number
  width: number
  height: number
}) {
  const wallThickness = 0.15
  const roofThickness = 0.18
  const floorThickness = 0.15

  const routes: {
    start: [number, number, number]
    end: [number, number, number]
  }[] = [
    // Front wall
    {
      start: [0, height * 0.55, width / 2 - 0.4],
      end: [0, height * 0.55, width / 2 + wallThickness + 0.4],
    },

    // Back wall
    {
      start: [0, height * 0.55, -width / 2 + 0.4],
      end: [0, height * 0.55, -width / 2 - wallThickness - 0.4],
    },

    // Right wall
    {
      start: [length / 2 - 0.4, height * 0.55, 0],
      end: [length / 2 + wallThickness + 0.4, height * 0.55, 0],
    },

    // Left wall
    {
      start: [-length / 2 + 0.4, height * 0.55, 0],
      end: [-length / 2 - wallThickness - 0.4, height * 0.55, 0],
    },

    // Roof
    {
      start: [0, height - 0.35, 0],
      end: [0, height + roofThickness + 0.4, 0],
    },

    // Floor
    {
      start: [0, floorThickness + 0.35, 0],
      end: [0, -0.4, 0],
    },
  ]

  return (
    <group>
      {routes.map((route, routeIndex) =>
        Array.from({ length: 4 }).map((_, particleIndex) => (
          <HeatParticle
            key={`${routeIndex}-${particleIndex}`}
            start={route.start}
            end={route.end}
            offset={particleIndex / 4}
            speed={0.18}
          />
        ))
      )}
    </group>
  )
}

function HeatParticle({
  start,
  end,
  offset,
  speed = 0.3,
}: HeatParticleProps) {
  const particle = useRef<Mesh>(null!)

  useFrame(({ clock }) => {
    const progress = (clock.elapsedTime * speed + offset) % 1

    particle.current.position.set(
      start[0] + (end[0] - start[0]) * progress,
      start[1] + (end[1] - start[1]) * progress,
      start[2] + (end[2] - start[2]) * progress
    )
  })

  return (
    <mesh ref={particle}>
      <sphereGeometry args={[0.055, 12, 12]} />
      <meshBasicMaterial color="#ff6b35" />
    </mesh>
  )
}


function ShelterModel({
  length,
  width,
  height,
  cutaway,
}: ShelterModelProps) {
  const wall = 0.15
  const roofThickness = 0.18
  
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, wall / 2, 0]} receiveShadow>
        <boxGeometry args={[length, wall, width]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, height / 2, -width / 2]}>
        <boxGeometry args={[length, height, wall]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.7} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-length / 2, height / 2, 0]}>
        <boxGeometry args={[wall, height, width]} />
        <meshStandardMaterial color="#0e7490" roughness={0.7} />
      </mesh>

      {/* Right wall */}
      <mesh position={[length / 2, height / 2, 0]}>
        <boxGeometry args={[wall, height, width]} />
        <meshStandardMaterial color="#0e7490" roughness={0.7} />
      </mesh>

      {/* Front wall - hidden in cutaway mode */}
      {!cutaway && (
        <mesh position={[0, height / 2, width / 2]}>
          <boxGeometry args={[length, height, wall]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.7} />
        </mesh>
      )}

      {/* Roof */}
      <mesh position={[0, height + roofThickness / 2, 0]}>
        <boxGeometry args={[length + 0.3, roofThickness, width + 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>
      <HeatFlow
        length={length}
        width={width}
        height={height}
      />

      {/* Interior partition */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.08, Math.min(1.6, height), width * 0.65]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
    </group>
  )
}

interface ShelterViewerProps {
  shelter: ShelterConfig
  setShelter: Dispatch<SetStateAction<ShelterConfig>>
}

export default function ShelterViewer({
  shelter,
  setShelter,
}: ShelterViewerProps) {
  const [cutaway, setCutaway] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [materialError, setMaterialError] = useState<string | null>(null)

  useEffect(() => {
  getMaterials()
    .then(setMaterials)
    .catch((err) => {
      setMaterialError(
        err instanceof Error ? err.message : 'Failed to load materials'
      )
    })
}, [])
  const { length_m, width_m, height_m } = shelter

  const resetShelter = () => {
    setShelter({
      length_m: 6,
      width_m: 4,
      height_m: 3,
      orientation: 'N',
      wall_u_value: 0.8,
      roof_u_value: 0.5,
      floor_u_value: 0.6,

      window_area_m2: 4,
      door_area_m2: 2,
    })
  }

  return (
    <div className="shelter-viewer">
      <div className="viewer-toolbar">
        <div>
          <h3>3D Shelter Preview</h3>
          <p>Interactive architectural visualization</p>
        </div>

        <button
          className="viewer-button"
          onClick={() => setCutaway((prev) => !prev)}
        >
          {cutaway ? <Eye size={16} /> : <EyeOff size={16} />}
          {cutaway ? 'Exterior' : 'Cutaway'}
        </button>
      </div>

      <div className="viewer-canvas">
        <Canvas
          camera={{
            position: [9, 7, 9],
            fov: 40,
            near: 0.1,
            far: 100,
          }}
          shadows
        >
          <ambientLight intensity={1.2} />

          <directionalLight
            position={[8, 10, 6]}
            intensity={2}
            castShadow
          />

          <ShelterModel
  length={length_m}
  width={width_m}
  height={height_m}
  cutaway={cutaway}
  wallColor="#38bdf8"
  roofColor="#334155"
  floorColor="#64748b"
/>

<Grid
  position={[0, -0.02, 0]}
  args={[30, 30]}
  cellSize={1}
  cellColor="#334155"
  sectionColor="#475569"
  fadeDistance={25}
  infiniteGrid
/>

<OrbitControls
  makeDefault
  target={[0, height_m / 2, 0]}
  enableDamping
  minDistance={5}
  maxDistance={25}
  maxPolarAngle={Math.PI / 2}
/>

<Environment preset="city" />
        </Canvas>
      </div>

      {/* Dimension controls */}
      {/* Material selection */}
<div className="dimension-controls material-controls">
  {materialError && (
    <p style={{ color: '#ef4444' }}>{materialError}</p>
  )}

  {(['wall', 'roof', 'floor'] as const).map((surface) => (
    <div key={surface}>
      <label>
        {surface.charAt(0).toUpperCase() + surface.slice(1)} Material
      </label>

      <select
        value={shelter[`${surface}_u_value`]}
        onChange={(e) =>
          setShelter((prev) => ({
            ...prev,
            [`${surface}_u_value`]: Number(e.target.value),
          }))
        }
      >
        {materials.map((material) => (
          <option
            key={material.id}
            value={material.thermal_conductivity / 0.15}
          >
            {material.name} — k: {material.thermal_conductivity} W/mK
          </option>
        ))}
      </select>
    </div>
  ))}
</div>

      <div className="viewer-footer">
        <span>Length: {length_m} m</span>
        <span>Width: {width_m} m</span>
        <span>Height: {height_m} m</span>

        <button className="reset-button" onClick={resetShelter}>
          <RotateCcw size={13} /> Reset
        </button>
      </div>
    </div>
  )
}

