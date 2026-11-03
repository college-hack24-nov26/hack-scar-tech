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

export type PageId =
  | 'Dashboard'
  | 'Shelter Designer'
  | 'Thermal Simulation'
  | 'Optimization'
  | 'Reports'

interface SidebarProps {
  activePage: PageId
  onNavigate: (page: PageId) => void
}

const navigation = [
  { label: 'Dashboard' as PageId, icon: LayoutDashboard },
  { label: 'Shelter Designer' as PageId, icon: House },
  { label: 'Thermal Simulation' as PageId, icon: Thermometer },
  { label: 'Optimization' as PageId, icon: SlidersHorizontal },
  { label: 'Reports' as PageId, icon: FileText },
]

export default function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
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
        {navigation.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.label)}
              className={`nav-item ${
                activePage === item.label ? 'active' : ''
              }`}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <button
          className={`nav-item ${
            activePage === 'Reports' ? '' : ''
          }`}
          onClick={() => onNavigate('Dashboard')}
        >
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