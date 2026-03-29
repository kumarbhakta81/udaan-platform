import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, APP_NAME } from '../../constants';

/**
 * Dashboard Layout - authenticated user layout with sidebar
 */
const DashboardLayout = () => {
  const { user, logout, isExpert, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  // Navigation items based on user role
  const navItems = [
    {
      label: 'Dashboard',
      to: ROUTES.DASHBOARD,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    ...(!isExpert ? [{
      label: 'Find Mentors',
      to: ROUTES.EXPLORE,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    }] : []),
    {
      label: 'My Requests',
      to: ROUTES.MY_REQUESTS,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Messages',
      to: ROUTES.MESSAGES,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
        </svg>
      ),
    },
    {
      label: 'Community',
      to: ROUTES.FORUM,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Resources',
      to: ROUTES.RESOURCES,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    ...(isAdmin ? [{
      label: 'Admin Panel',
      to: ROUTES.ADMIN,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    }] : []),
  ];

  const bottomNavItems = [
    { label: 'My Profile', to: ROUTES.MY_PROFILE },
    { label: 'Settings', to: ROUTES.SETTINGS },
  ];

  const sidebarNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-50 text-primary-700 font-semibold'
        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
    }`;

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* ── Sidebar Overlay (mobile) ───────────────────────────── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-neutral-100 z-40 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-neutral-100">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 no-underline">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">U</span>
            </div>
            <span className="text-lg font-heading font-bold text-neutral-900">{APP_NAME}</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto lg:hidden text-neutral-400 hover:text-neutral-600"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User summary */}
        <div className="px-4 py-4 border-b border-neutral-100">
          <Link to={ROUTES.MY_PROFILE} className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors no-underline">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-primary-600">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</p>
              <p className="text-xs text-neutral-400 capitalize">{user?.role}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main">
          {navItems.map(({ label, to, icon }) => (
            <NavLink key={to} to={to} className={sidebarNavLinkClass} end={to === ROUTES.DASHBOARD}>
              <span className="flex-shrink-0">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-4 border-t border-neutral-100 space-y-1">
          {bottomNavItems.map(({ label, to }) => (
            <NavLink key={to} to={to} className={sidebarNavLinkClass}>
              <span className="text-neutral-500">
                {label === 'My Profile' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-error-600 hover:bg-error-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top bar (mobile) */}
        <header className="h-14 bg-white border-b border-neutral-100 flex items-center justify-between px-4 lg:hidden sticky top-0 z-20">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-600 hover:bg-neutral-100"
            aria-label="Open sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-base font-heading font-bold text-neutral-900">{APP_NAME}</span>
          <Link to={ROUTES.MESSAGES} className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 no-underline">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
            </svg>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
