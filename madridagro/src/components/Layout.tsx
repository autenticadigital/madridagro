import { Outlet, NavLink } from 'react-router-dom';
import { Home, ClipboardList, Package, Users, Receipt, LogOut, Download, Settings, Truck, ArrowDownRight } from 'lucide-react';

import { Logo } from './ui/Logo';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { supabase } from '../lib/supabase';

export function Layout() {
  const { isInstallable, promptInstall } = usePWAInstall();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { to: '/', icon: <Home size={24} />, label: 'Início' },
    { to: '/logistica', icon: <Truck size={24} />, label: 'Logística' },
    { to: '/vendas', icon: <ClipboardList size={24} />, label: 'Vendas' },
    { to: '/estoque', icon: <Package size={24} />, label: 'Estoque' },
    { to: '/clientes', icon: <Users size={24} />, label: 'Clientes' },
    { to: '/fiados', icon: <Receipt size={24} />, label: 'A Receber' },
    { to: '/contas-pagar', icon: <ArrowDownRight size={24} />, label: 'A Pagar' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-palette-5/50 text-text-main flex flex-col pb-20 md:pb-0 md:pl-20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-20 bg-white border-r border-palette-4 shadow-lg items-center py-6 z-50">
        <div className="mb-8 flex flex-col items-center">
          <Logo className="w-12 h-auto drop-shadow-sm" />
        </div>
        <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center p-3 w-full rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-white bg-palette-1 shadow-md'
                    : 'text-palette-2 hover:text-palette-1 hover:bg-palette-5/50'
                }`
              }
              title={item.label}
            >
              {item.icon}
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-col gap-2 px-2 mt-auto">
          {isInstallable && (
            <button 
              onClick={promptInstall}
              className="text-palette-1 hover:text-palette-2 p-3 transition-colors bg-palette-5/10 rounded-xl"
              title="Instalar Aplicativo"
            >
              <Download size={24} />
            </button>
          )}
          <button onClick={handleLogout} className="text-palette-2 hover:text-red-500 p-3 transition-colors bg-palette-5/10 rounded-xl">
            <LogOut size={24} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300">
        <Outlet />
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-white border-t border-palette-4 shadow-[0_-4px_15px_rgba(0,0,0,0.05)] flex items-center justify-around z-50 px-2 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
                isActive ? 'text-palette-1 scale-110 drop-shadow-sm' : 'text-text-light hover:text-palette-1'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-semibold">{item.label}</span>
          </NavLink>
        ))}
        {isInstallable && (
          <button 
            onClick={promptInstall}
            className="flex flex-col items-center justify-center w-full h-full text-palette-1 hover:text-palette-2 transition-all duration-300 animate-pulse"
          >
            <Download size={24} />
            <span className="text-[10px] mt-1 font-bold">App</span>
          </button>
        )}
      </nav>
    </div>
  );
}
