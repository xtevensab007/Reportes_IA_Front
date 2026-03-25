// =============================================
// components/layout/AppLayout.tsx
// =============================================

import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

const AppLayout: React.FC = () => {
  return (
    <div className="app-layout">
      {/* Desktop sidebar */}
      <Sidebar />
      <main className="main-content">
        {/* Mobile top bar + bottom nav (hidden on desktop via CSS) */}
        <TopBar />
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
