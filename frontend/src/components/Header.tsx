import { Bell, ChevronDown, MapPin } from 'lucide-react'

export default function Header() {
  return (
    <header className="top-header">
      <div className="breadcrumb">
        <span>Workspace</span>
        <span className="breadcrumb-divider">/</span>
        <strong>Dashboard</strong>
      </div>

      <div className="header-actions">
        <div className="location-selector">
          <MapPin size={16} />
          <span>Ladakh, India</span>
          <ChevronDown size={14} />
        </div>

        <button className="notification-button">
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="profile">
          <div className="profile-avatar">TS</div>
          <div className="profile-info">
            <strong>Project Team</strong>
            <span>Administrator</span>
          </div>
          <ChevronDown size={15} />
        </div>
      </div>
    </header>
  )
}