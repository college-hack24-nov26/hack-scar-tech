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

  const doorWidth = 0.95
  const doorHeight = Math.min(2.1, height * 0.8)

  const windowWidth = 1.1
  const windowHeight = 1.0
  const windowSill = 1.0

  const frontZ = width / 2
  const sideX = -length / 2

  // Keep openings within the shelter dimensions.
  const safeDoorWidth = Math.min(doorWidth, length * 0.3)
  const safeWindowWidth = Math.min(windowWidth, length * 0.25)
  const safeSideWindowWidth = Math.min(windowWidth, width * 0.25)

  const doorLeft = -safeDoorWidth / 2
  const doorRight = safeDoorWidth / 2

  const frontWindowCenter = length * 0.27
  const frontWindowLeft = frontWindowCenter - safeWindowWidth / 2
  const frontWindowRight = frontWindowCenter + safeWindowWidth / 2

  const windowBottom = Math.min(windowSill, height * 0.35)
  const windowTop = Math.min(
    windowBottom + windowHeight,
    height - 0.25
  )

  const windowActualHeight = windowTop - windowBottom

  const WallSegment = ({
    position,
    size,
  }: {
    position: [number, number, number]
    size: [number, number, number]
  }) => (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#38bdf8" roughness={0.7} />
    </mesh>
  )

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -wall / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[length, wall, width]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>

      {/* Back wall */}
      <WallSegment
        position={[0, height / 2, -width / 2]}
        size={[length, height, wall]}
      />

      {/* Front wall: left of entrance */}
      {!cutaway && (
        <>
      <WallSegment
        position={[
          (-length / 2 + doorLeft) / 2,
          height / 2,
          frontZ,
        ]}
        size={[
          length / 2 + doorLeft,
          height,
          wall,
        ]}
      />

      {/* Front wall: between entrance and window */}
      <WallSegment
        position={[
          (doorRight + frontWindowLeft) / 2,
          height / 2,
          frontZ,
        ]}
        size={[
          frontWindowLeft - doorRight,
          height,
          wall,
        ]}
      />

      {/* Front wall: right of window */}
      <WallSegment
        position={[
          (frontWindowRight + length / 2) / 2,
          height / 2,
          frontZ,
        ]}
        size={[
          length / 2 - frontWindowRight,
          height,
          wall,
        ]}
      />

      {/* Front wall: above entrance */}
      <WallSegment
        position={[
          0,
          (doorHeight + height) / 2,
          frontZ,
        ]}
        size={[
          safeDoorWidth,
          height - doorHeight,
          wall,
        ]}
      />

      {/* Front wall: below window */}
      <WallSegment
        position={[
          frontWindowCenter,
          windowBottom / 2,
          frontZ,
        ]}
        size={[
          safeWindowWidth,
          windowBottom,
          wall,
        ]}
      />

      {/* Front wall: above window */}
      <WallSegment
        position={[
          frontWindowCenter,
          (windowTop + height) / 2,
          frontZ,
        ]}
        size={[
          safeWindowWidth,
          height - windowTop,
          wall,
        ]}
      />

      {/* Front window glass */}
      <mesh
        position={[
          frontWindowCenter,
          windowBottom + windowActualHeight / 2,
          frontZ,
        ]}
      >
        <boxGeometry args={[safeWindowWidth, windowActualHeight, 0.04]} />
        <meshPhysicalMaterial
          color="#7dd3fc"
          transparent
          opacity={0.35}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
      {/* Front window frame */}
<group position={[frontWindowCenter, windowBottom + windowActualHeight / 2, frontZ + 0.04]}>
  {/* Top */}
  <mesh position={[0, windowActualHeight / 2, 0]}>
    <boxGeometry args={[safeWindowWidth + 0.08, 0.06, 0.08]} />
    <meshStandardMaterial color="#334155" />
  </mesh>

  {/* Bottom */}
  <mesh position={[0, -windowActualHeight / 2, 0]}>
    <boxGeometry args={[safeWindowWidth + 0.08, 0.06, 0.08]} />
    <meshStandardMaterial color="#334155" />
  </mesh>

  {/* Left */}
  <mesh position={[-safeWindowWidth / 2, 0, 0]}>
    <boxGeometry args={[0.06, windowActualHeight, 0.08]} />
    <meshStandardMaterial color="#334155" />
  </mesh>

  {/* Right */}
  <mesh position={[safeWindowWidth / 2, 0, 0]}>
    <boxGeometry args={[0.06, windowActualHeight, 0.08]} />
    <meshStandardMaterial color="#334155" />
  </mesh>
</group>

      {/* Entrance door */}
      <mesh
        position={[0, doorHeight / 2, frontZ]}
        castShadow
      >
        <boxGeometry args={[safeDoorWidth * 0.94, doorHeight * 0.98, 0.06]} />
        <meshStandardMaterial color="#92400e" roughness={0.7} />
      </mesh>

      {/* Door handle */}
      <mesh position={[safeDoorWidth * 0.32, doorHeight * 0.48, frontZ + 0.06]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.7} />
      </mesh>
      {/* Door frame */}
<group position={[0, doorHeight / 2, frontZ + 0.1]}>
  {/* Left frame */}
  <mesh position={[-safeDoorWidth / 2 - 0.04, 0, 0]}>
    <boxGeometry args={[0.08, doorHeight, 0.08]} />
    <meshStandardMaterial color="#475569" />
  </mesh>

  {/* Right frame */}
  <mesh position={[safeDoorWidth / 2 + 0.04, 0, 0]}>
    <boxGeometry args={[0.08, doorHeight, 0.08]} />
    <meshStandardMaterial color="#475569" />
  </mesh>

  {/* Top frame */}
  <mesh position={[0, doorHeight / 2, 0]}>
    <boxGeometry args={[safeDoorWidth + 0.16, 0.08, 0.08]} />
    <meshStandardMaterial color="#475569" />
  </mesh>
</group>
</>
      )}

      {/* Left side wall with window opening */}
      <WallSegment
        position={[sideX, height / 2, (-width / 2 + (-safeSideWindowWidth / 2)) / 2]}
        size={[wall, height, width / 2 - safeSideWindowWidth / 2]}
      />

      <WallSegment
        position={[sideX, height / 2, (safeSideWindowWidth / 2 + width / 2) / 2]}
        size={[wall, height, width / 2 - safeSideWindowWidth / 2]}
      />

      <WallSegment
        position={[sideX, windowBottom / 2, 0]}
        size={[wall, windowBottom, safeSideWindowWidth]}
      />

      <WallSegment
        position={[sideX, (windowTop + height) / 2, 0]}
        size={[wall, height - windowTop, safeSideWindowWidth]}
      />

      {/* Side window glass */}
      <mesh position={[sideX, windowBottom + windowActualHeight / 2, 0]}>
        <boxGeometry args={[0.04, windowActualHeight, safeSideWindowWidth]} />
        <meshPhysicalMaterial
          color="#7dd3fc"
          transparent
          opacity={0.35}
          roughness={0.1}
        />
      </mesh>
      {/* Side window frame */}
<group position={[sideX - 0.04, windowBottom + windowActualHeight / 2, 0]}>
  {/* Top */}
  <mesh position={[0, windowActualHeight / 2, 0]}>
    <boxGeometry args={[0.08, 0.06, safeSideWindowWidth + 0.08]} />
    <meshStandardMaterial color="#334155" />
  </mesh>

  {/* Bottom */}
  <mesh position={[0, -windowActualHeight / 2, 0]}>
    <boxGeometry args={[0.08, 0.06, safeSideWindowWidth + 0.08]} />
    <meshStandardMaterial color="#334155" />
  </mesh>

  {/* Left */}
  <mesh position={[0, 0, -safeSideWindowWidth / 2]}>
    <boxGeometry args={[0.08, windowActualHeight, 0.06]} />
    <meshStandardMaterial color="#334155" />
  </mesh>

  {/* Right */}
  <mesh position={[0, 0, safeSideWindowWidth / 2]}>
    <boxGeometry args={[0.08, windowActualHeight, 0.06]} />
    <meshStandardMaterial color="#334155" />
  </mesh>
</group>

      {/* Layered right wall */}


{/* Right wall construction assembly */}

{!cutaway ? (
  /* Complete exterior cladding */
  <mesh
    position={[length / 2 + 0.065, height / 2, 0]}
    castShadow
    receiveShadow
  >
    <boxGeometry args={[0.02, height, width]} />
    <meshStandardMaterial color="#64748b" roughness={0.8} />
  </mesh>
) : (
  <>
    {/* Outer cladding with central inspection opening */}
    {[-1, 1].map((side) => (
      <mesh
        key={`outer-${side}`}
        position={[
          length / 2 + 0.065,
          height / 2,
          side * width * 0.32,
        ]}
      >
        <boxGeometry args={[0.02, height, width * 0.36]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>
    ))}

    {/* Insulation core */}
    <mesh
      position={[length / 2 + 0.025, height / 2, 0]}
      castShadow
    >
      <boxGeometry args={[0.07, height, width * 0.28]} />
      <meshStandardMaterial color="#f59e0b" roughness={0.9} />
    </mesh>

    {/* Inner lining */}
    <mesh
      position={[length / 2 - 0.035, height / 2, 0]}
      castShadow
    >
      <boxGeometry args={[0.03, height, width]} />
      <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
    </mesh>

    {/* Inspection-section boundary markers */}
    {[-1, 1].map((side) => (
      <mesh
        key={`edge-${side}`}
        position={[
          length / 2 + 0.08,
          height / 2,
          side * width * 0.14,
        ]}
      >
        <boxGeometry args={[0.015, height, 0.025]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
    ))}
  </>
)}
      

      {/* Slightly sloped roof */}
      <mesh
        position={[0, height + roofThickness / 2, 0]}
        rotation={[0, 0, -0.025]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[length + 0.4, roofThickness, width + 0.4]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Interior partition */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.08, Math.min(1.6, height), width * 0.65]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>

      {/* Heat flow */}
      <HeatFlow
        length={length}
        width={width}
        height={height}
      />
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

