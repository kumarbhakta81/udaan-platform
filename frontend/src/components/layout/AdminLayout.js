import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, APP_NAME } from '../../constants';

/**
 * Admin Layout - dedicated layout for admin panel
 */
const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const adminNavItems = [
    {
      label: 'Overview',
      to: ROUTES.ADMIN,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
    {
      label: 'Users',
      to: ROUTES.ADMIN_USERS,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    },
    {
      label: 'Moderation',
      to: ROUTES.ADMIN_MODERATION,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: 'Analytics',
      to: ROUTES.ADMIN_ANALYTICS,
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
  ];

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
    }`;

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-white border-r border-neutral-100 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center gap-2 px-4 h-16 border-b border-neutral-100">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">U</span>
          </div>
          <div>
            <span className="text-sm font-heading font-bold text-neutral-900">{APP_NAME}</span>
            <p className="text-2xs text-primary-600 font-medium">Admin Panel</p>
          </div>
        </div>

        {/* Admin badge */}
        <div className="px-4 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2.5 p-2 bg-primary-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-900 truncate">{user?.name}</p>
              <span className="text-2xs text-primary-600 font-medium bg-primary-100 px-1.5 py-0.5 rounded-full">Administrator</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNavItems.map(({ label, to, icon }) => (
            <NavLink key={to} to={to} className={navLinkClass} end={to === ROUTES.ADMIN}>
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 border-t border-neutral-100 pt-4 space-y-1">
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-xl no-underline">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
            Back to App
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-error-600 hover:bg-error-50 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-60">
        <header className="h-14 bg-white border-b border-neutral-100 flex items-center px-4 lg:hidden sticky top-0 z-20">
          <button onClick={() => setIsSidebarOpen(true)} className="mr-3 text-neutral-600" aria-label="Open menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="text-sm font-bold text-neutral-900">Admin Panel</span>
        </header>

        <main className="flex-1 p-4 lg:p-8" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
