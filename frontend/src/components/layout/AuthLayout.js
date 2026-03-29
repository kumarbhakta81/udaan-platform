import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ROUTES, APP_NAME } from '../../constants';

/**
 * Auth Layout - minimal layout for login, register, and password reset pages
 * Split-screen design: left branding, right form
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel - Branding (hidden on mobile) ──────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 relative overflow-hidden flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Logo */}
        <div className="relative">
          <Link to={ROUTES.HOME} className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-lg">U</span>
            </div>
            <span className="text-2xl font-heading font-bold text-white">{APP_NAME}</span>
          </Link>
        </div>

        {/* Tagline + Features */}
        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-heading font-bold text-white leading-tight mb-4">
              Rise Together.<br />
              Grow Together.
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Connect with mentors, share knowledge, and build your career in a
              community that lifts each other up.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: '🤝', text: '500+ verified mentors across industries' },
              { icon: '🎯', text: 'Personalized mentorship matching' },
              { icon: '📚', text: 'Curated resources and learning paths' },
              { icon: '💬', text: 'Active community of 5,000+ members' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-white/90 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <p className="text-white/90 text-sm italic leading-relaxed mb-3">
            "Udaan connected me with an amazing mentor who helped me crack my first tech
            interview. This platform truly changes lives."
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AK</span>
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Anita Kumar</p>
              <p className="text-white/60 text-xs">Software Engineer, Bangalore</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel - Form ─────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile logo header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-neutral-100">
          <Link to={ROUTES.HOME} className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="text-lg font-heading font-bold text-neutral-900">{APP_NAME}</span>
          </Link>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 overflow-y-auto">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
