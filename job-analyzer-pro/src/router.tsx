import { createBrowserRouter } from 'react-router-dom'

// Placeholder components (to be implemented)
const Dashboard = () => <div className="p-8"><h1 className="text-3xl font-bold">Dashboard</h1></div>
const Settings = () => <div className="p-8"><h1 className="text-3xl font-bold">Settings</h1></div>
const Optimize = () => <div className="p-8"><h1 className="text-3xl font-bold">Optimize Resume</h1></div>
const Login = () => <div className="p-8"><h1 className="text-3xl font-bold">Login</h1></div>
const AdminDashboard = () => <div className="p-8"><h1 className="text-3xl font-bold">Admin Dashboard</h1></div>

const RootLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">Job Analyzer Pro</h1>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <main>
      <div id="detail">
        {/* Outlet will be rendered here by React Router */}
      </div>
    </main>
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'settings', element: <Settings /> },
      { path: 'optimize', element: <Optimize /> },
      {
        path: 'admin',
        children: [
          { index: true, element: <AdminDashboard /> },
        ],
      },
    ],
  },
  { path: '/login', element: <Login /> },
])
