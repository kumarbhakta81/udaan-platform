import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, APP_NAME } from '../../constants';

/**
 * Main Navigation Bar
 * Responsive with mobile hamburger menu
 */
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Detect scroll for navbar background change
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const navLinks = [
    { to: ROUTES.EXPLORE, label: 'Find Mentors' },
    { to: ROUTES.FORUM, label: 'Community' },
    { to: ROUTES.RESOURCES, label: 'Resources' },
  ];

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-primary-600'
        : 'text-neutral-600 hover:text-neutral-900'
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-soft'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* ── Logo ──────────────────────────────────────────── */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 no-underline"
            aria-label={`${APP_NAME} - Home`}
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="text-xl font-heading font-bold text-neutral-900">
              {APP_NAME}
            </span>
          </Link>

          {/* ── Desktop Nav Links ──────────────────────────────── */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass} onClick={closeMobileMenu}>
                {label}
              </NavLink>
            ))}
          </div>

          {/* ── Auth Area ──────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications bell */}
                <button
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                  aria-label="Notifications"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {/* Unread indicator */}
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" aria-hidden="true" />
                </button>

                {/* Messages */}
                <Link
                  to={ROUTES.MESSAGES}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors no-underline"
                  aria-label="Messages"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-4 4v-4z" />
                  </svg>
                </Link>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-xl hover:bg-neutral-100 px-2 py-1.5 transition-colors"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary-600">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-neutral-700 max-w-24 truncate">
                      {user?.name?.split(' ')[0] || 'User'}
                    </span>
                    <svg className={`w-4 h-4 text-neutral-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-neutral-100 py-1.5 animate-slide-down">
                      <div className="px-4 py-2 border-b border-neutral-100 mb-1">
                        <p className="text-sm font-semibold text-neutral-900 truncate">{user?.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                      </div>
                      <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 no-underline" onClick={() => setIsUserMenuOpen(false)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Dashboard
                      </Link>
                      <Link to={ROUTES.MY_PROFILE} className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 no-underline" onClick={() => setIsUserMenuOpen(false)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        My Profile
                      </Link>
                      <Link to={ROUTES.MY_REQUESTS} className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 no-underline" onClick={() => setIsUserMenuOpen(false)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        My Requests
                      </Link>
                      <Link to={ROUTES.SETTINGS} className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 no-underline" onClick={() => setIsUserMenuOpen(false)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Settings
                      </Link>
                      <div className="border-t border-neutral-100 mt-1 pt-1">
                        <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors text-left">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="btn btn-ghost btn-sm text-neutral-700 no-underline">
                  Login
                </Link>
                <Link to={ROUTES.REGISTER} className="btn btn-primary btn-sm no-underline">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ───────────────────────────────── */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* ── Mobile Menu ────────────────────────────────────── */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-100 py-4 animate-slide-down">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `block px-4 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`
                }
                onClick={closeMobileMenu}
              >
                {label}
              </NavLink>
            ))}

            <div className="border-t border-neutral-100 mt-3 pt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary-600">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
                      <p className="text-xs text-neutral-400">{user?.role}</p>
                    </div>
                  </div>
                  <Link to={ROUTES.DASHBOARD} className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 rounded-xl no-underline" onClick={closeMobileMenu}>Dashboard</Link>
                  <Link to={ROUTES.MY_PROFILE} className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 rounded-xl no-underline" onClick={closeMobileMenu}>My Profile</Link>
                  <Link to={ROUTES.MESSAGES} className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 rounded-xl no-underline" onClick={closeMobileMenu}>Messages</Link>
                  <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="text-left px-4 py-2.5 text-sm text-error-600 hover:bg-error-50 rounded-xl w-full">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN} className="btn btn-outline w-full no-underline" onClick={closeMobileMenu}>Login</Link>
                  <Link to={ROUTES.REGISTER} className="btn btn-primary w-full no-underline" onClick={closeMobileMenu}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
