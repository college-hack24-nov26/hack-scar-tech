import {
  LayoutDashboard,
  House,
  Thermometer,
  SlidersHorizontal,
  FileText,
  Settings,
  Snowflake,
  ChevronLeft,
} from 'lucide-react'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Shelter Designer', icon: House },
  { label: 'Thermal Simulation', icon: Thermometer },
  { label: 'Optimization', icon: SlidersHorizontal },
  { label: 'Reports', icon: FileText },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Snowflake size={23} />
        </div>

        <div>
          <h2>ThermoShelter</h2>
          <span>AI DESIGN PLATFORM</span>
        </div>
      </div>

      <div className="workspace-label">WORKSPACE</div>

      <nav className="sidebar-nav">
        {navigation.map((item, index) => {
          const Icon = item.icon

          return (
            <button
              key={item.label}
              className={`nav-item ${index === 0 ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item">
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div className="sidebar-footer">
          <div className="footer-icon">
            <Snowflake size={17} />
          </div>
          <div>
            <strong>ThermoShelter AI</strong>
            <span>Version 1.0 · Prototype</span>
          </div>
          <ChevronLeft size={16} />
        </div>
      </div>
    </aside>
  )
}