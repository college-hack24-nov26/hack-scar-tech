import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  unit?: string
  description: string
  icon: LucideIcon
  color: string
}

export default function StatCard({
  title,
  value,
  unit,
  description,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${color}`}>
          <Icon size={19} />
        </div>
      </div>

      <div className="stat-value">
        {value}
        {unit && <span>{unit}</span>}
      </div>

      <p>{description}</p>
    </div>
  )
}