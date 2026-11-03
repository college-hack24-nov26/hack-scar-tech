import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment } from '@react-three/drei'
import { Eye, EyeOff, RotateCcw } from 'lucide-react'
import type { ShelterConfig } from '../types/shelter'

interface ShelterModelProps {
  length: number
  width: number
  height: number
  cutaway: boolean
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
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.75} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-length / 2, height / 2, 0]}>
        <boxGeometry args={[wall, height, width]} />
        <meshStandardMaterial color="#0e7490" transparent opacity={0.8} />
      </mesh>

      {/* Right wall */}
      <mesh position={[length / 2, height / 2, 0]}>
        <boxGeometry args={[wall, height, width]} />
        <meshStandardMaterial color="#0e7490" transparent opacity={0.8} />
      </mesh>

      {/* Front wall */}
      {!cutaway && (
        <mesh position={[0, height / 2, width / 2]}>
          <boxGeometry args={[length, height, wall]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.75} />
        </mesh>
      )}

      {/* Roof */}
      <mesh position={[0, height + roofThickness / 2, 0]}>
        <boxGeometry args={[length + 0.3, roofThickness, width + 0.3]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Interior partition / reference object */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.08, 1.6, width * 0.65]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
    </group>
  )
}

interface ShelterViewerProps {
  shelter: ShelterConfig
  setShelter:React.Dispatch<React.SetStateAction<ShelterConfig>>
}
export default function ShelterViewer({shelter,setShelter}:ShelterViewerProps) {
    const[cutaway,setCutaway] = useState(false)
    const {length_m,width_m,height_m} = shelter

  return (
    <div className="shelter-viewer">
      <div className="viewer-toolbar">
        <div>
          <h3>3D Shelter Preview</h3>
          <p>Interactive architectural visualization</p>
        </div>

        <button
          className="viewer-button"
          onClick={() => setCutaway(!cutaway)}
        >
          {cutaway ? <Eye size={16} /> : <EyeOff size={16} />}
          {cutaway ? 'Exterior' : 'Cutaway'}
        </button>
      </div>

      <div className="viewer-canvas">
        <Canvas
          camera={{ position: [9, 7, 9], fov: 40 }}
          shadows
        >
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[8, 10, 6]}
            intensity={2}
            castShadow
          />

          <ShelterModel
            length={length}
            width={width_m}
            height={height_m}
            cutaway={cutaway}
          />

          <Grid
            position={[0, -0.02, 0]}
            args={[20, 20]}
            cellSize={1}
            cellColor="#334155"
            sectionColor="#475569"
            fadeDistance={25}
          />

          <OrbitControls
            makeDefault
            enableDamping
            minDistance={5}
            maxDistance={20}
          />

          <Environment preset="city" />
        </Canvas>
      </div>

      <div className="dimension-controls">
        <div>
          <label>Length: {length} m</label>
          <input
            type="range"
            min="3"
            max="12"
            value={length_m}
            onChange={(e) => setShelter({...shelter, length_m: Number(e.target.value)})}
          />
        </div>

        <div>
          <label>Width: {width_m} m</label>
         <input
  type="range"
  min="3"
  max="10"
  value={width_m}
  onChange={(e) =>
    setShelter((prev) => ({
      ...prev,
      width_m: Number(e.target.value),
    }))
  }
/>
        </div>

        <div>
          <label>Height: {height_m} m</label>
          <input
            type="range"
            min="2"
            max="5"
            value={height_m}
            onChange={(e) => setShelter({...shelter, height_m: Number(e.target.value)})}
          />
        </div>
      </div>

      <div className="viewer-footer">
        <span>Length: {length_m}m</span>
        <span>Width: {width_m}m</span>
        <span>Height: {height_m}m</span>
        <button
          className="reset-button"
          onClick={() => {
            setShelter({
              length_m: 6,
              width_m: 4,
              height_m: 3,
              orientation: 'N'
            })
          }}
        >
          <RotateCcw size={13} /> Reset
        </button>
      </div>
    </div>
  )
}