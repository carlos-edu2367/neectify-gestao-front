import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Shell() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="p-4 pb-20 md:ml-52 md:p-6 md:pb-6">
        <Outlet />
      </main>
    </div>
  )
}
