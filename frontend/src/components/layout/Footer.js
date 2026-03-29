import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, APP_NAME } from '../../constants';

/**
 * Main Footer Component
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Platform: [
      { label: 'Find Mentors', to: ROUTES.EXPLORE },
      { label: 'Community Forum', to: ROUTES.FORUM },
      { label: 'Resource Library', to: ROUTES.RESOURCES },
      { label: 'Become a Mentor', to: ROUTES.REGISTER },
    ],
    Company: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Mission', to: '/mission' },
      { label: 'Blog', to: '/blog' },
      { label: 'Careers', to: '/careers' },
    ],
    Support: [
      { label: 'Help Center', to: '/help' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  };

  return (
    <footer className="bg-neutral-900 text-neutral-300" role="contentinfo">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* ── Brand Column ─────────────────────────────────── */}
          <div className="lg:col-span-1">
            <Link to={ROUTES.HOME} className="flex items-center gap-2 no-underline mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="text-xl font-heading font-bold text-white">{APP_NAME}</span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6">
              Empowering Dalit students, professionals, and experts through meaningful
              mentorship and community connections.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { href: 'https://twitter.com', label: 'Twitter', icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                )},
                { href: 'https://linkedin.com', label: 'LinkedIn', icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                )},
                { href: 'https://instagram.com', label: 'Instagram', icon: (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                )},
              ].map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 hover:bg-primary-600 hover:text-white transition-all duration-200 no-underline"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Link Columns ─────────────────────────────────── */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-neutral-400 hover:text-white transition-colors no-underline"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom Bar ────────────────────────────────────── */}
        <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {currentYear} {APP_NAME}. Built with ❤️ for the Dalit community.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="text-xs text-neutral-500 hover:text-neutral-300 no-underline">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-neutral-500 hover:text-neutral-300 no-underline">Terms of Service</Link>
            <Link to="/accessibility" className="text-xs text-neutral-500 hover:text-neutral-300 no-underline">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
