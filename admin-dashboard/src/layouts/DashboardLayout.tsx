import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Award,
  FlaskConical,
  Lightbulb,
  Heart,
  Zap,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Articles', href: '/articles', icon: FileText },
  { name: 'Certificates', href: '/certificates', icon: Award },
  { name: 'Research', href: '/research', icon: FlaskConical },
  { name: 'Ideas', href: '/ideas', icon: Lightbulb },
  { name: 'Life', href: '/life', icon: Heart },
  { name: 'Now Focus', href: '/now', icon: Zap },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardLayout() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Admin</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-white text-black'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white font-medium">
                {admin?.name?.charAt(0) || admin?.email?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {admin?.name || 'Admin'}
                </p>
                <p className="text-xs text-zinc-500 truncate">{admin?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition"
            >
              <LogOut size={18} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
