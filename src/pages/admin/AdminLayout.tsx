import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, LogOut, ArrowLeft, Menu, X } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    navigate('/admin');
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700'
    }`;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar for mobile */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-blue-50 to-white shadow-lg flex flex-col transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <h1 className="text-xl font-bold text-white">Tableau de bord</h1>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-blue-100 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-grow p-4 space-y-1.5">
          <div className="px-2 py-3 mb-2">
            <button 
              onClick={handleGoBack} 
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              <ArrowLeft className="h-5 w-5 mr-3" />
              Retour au site
            </button>
          </div>
          
          <div className="px-2 py-1 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 mt-4">
            Menu principal
          </div>
          
          <NavLink 
            to="/admin/dashboard" 
            className={navLinkClasses} 
            end 
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Tableau de bord
          </NavLink>
          
          <div className="px-2 py-1 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 mt-4">
            Gestion
          </div>
          
          <NavLink 
            to="/admin/products" 
            className={navLinkClasses} 
            onClick={() => setSidebarOpen(false)}
          >
            <ShoppingBag className="h-5 w-5 mr-3" />
            Produits
          </NavLink>
          
          <NavLink 
            to="/admin/orders" 
            className={navLinkClasses} 
            onClick={() => setSidebarOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Commandes
          </NavLink>
          
          <NavLink 
            to="/admin/users" 
            className={navLinkClasses} 
            onClick={() => setSidebarOpen(false)}
          >
            <Users className="h-5 w-5 mr-3" />
            Utilisateurs
          </NavLink>
        </nav>
        <div className="mt-auto p-4 border-t border-gray-200 bg-blue-50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10 border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  type="button"
                  className="md:hidden text-gray-500 hover:text-gray-700"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Ouvrir le menu</span>
                  <Menu className="h-6 w-6" />
                </button>
                <h2 className="ml-4 text-lg font-medium text-gray-900">
                  {(() => {
                    const path = window.location.pathname.split('/').pop() || '';
                    return path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Tableau de bord';
                  })()}
                </h2>
              </div>
              <div className="flex items-center">
                <div className="ml-4 flex items-center">
                  <span className="text-sm text-gray-600 mr-2">
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
