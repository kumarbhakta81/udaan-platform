import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES, APP_NAME, EXPERTISE_CATEGORIES } from '../constants';

// ── Stats Data ─────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Expert Mentors', value: '500+', icon: '🌟' },
  { label: 'Community Members', value: '5,000+', icon: '👥' },
  { label: 'Sessions Completed', value: '2,400+', icon: '🎯' },
  { label: 'Success Stories', value: '800+', icon: '💼' },
];

// ── Featured Mentors (placeholder) ─────────────────────────────────────────
const FEATURED_MENTORS = [
  {
    id: '1', name: 'Dr. Priya Ambedkar', role: 'Senior Engineer @ Google',
    expertise: 'Software Engineering', sessions: 124, rating: 4.9,
    initials: 'PA', category: 'software_engineering',
  },
  {
    id: '2', name: 'Rahul Jadhav', role: 'IAS Officer, IAS 2018',
    expertise: 'Civil Services', sessions: 89, rating: 5.0,
    initials: 'RJ', category: 'civil_services',
  },
  {
    id: '3', name: 'Sunita Meshram', role: 'Advocate, Supreme Court',
    expertise: 'Law & Legal', sessions: 67, rating: 4.8,
    initials: 'SM', category: 'law',
  },
  {
    id: '4', name: 'Anil Paswan', role: 'Founder, TechForAll',
    expertise: 'Entrepreneurship', sessions: 143, rating: 4.9,
    initials: 'AP', category: 'entrepreneurship',
  },
  {
    id: '5', name: 'Dr. Kavita Bharti', role: 'Professor, IIT Delhi',
    expertise: 'Education & Academia', sessions: 211, rating: 5.0,
    initials: 'KB', category: 'education',
  },
  {
    id: '6', name: 'Manoj Thorat', role: 'Product Manager @ Microsoft',
    expertise: 'Product Management', sessions: 76, rating: 4.7,
    initials: 'MT', category: 'product_management',
  },
];

// ── How It Works ───────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Account',
    desc: 'Sign up in seconds with your email or Google/LinkedIn. Choose your role as a seeker or expert mentor.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Discover Mentors',
    desc: 'Browse verified experts by industry, skills, and availability. Read reviews and find your perfect match.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Request Mentorship',
    desc: 'Send a personalized mentorship request describing your goals. Get matched and start your journey.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Grow Together',
    desc: 'Have 1-on-1 sessions, engage with the community forum, access curated resources, and track your progress.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

// ── Testimonials ───────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Udaan connected me with an IAS mentor who guided me through my UPSC preparation. I cleared the exam in my second attempt. This platform changed my life.",
    name: 'Deepak Kumar', role: 'IAS Probationer, 2023 Batch', initials: 'DK',
  },
  {
    quote: "As a first-generation college student from a small town, I had no one to guide me in tech. My Udaan mentor helped me crack my first SDE role at a top company.",
    name: 'Pooja Salve', role: 'Software Developer @ Flipkart', initials: 'PS',
  },
  {
    quote: "The community forum and resource library are incredible. I learned more here in 3 months than I did in years of searching alone.",
    name: 'Vijay Meshram', role: 'Startup Founder', initials: 'VM',
  },
];

// ── Features ───────────────────────────────────────────────────────────────
const FEATURES = [
  {
    title: 'Expert Mentorship',
    desc: 'Connect 1-on-1 with verified professionals across law, tech, business, academia, and civil services.',
    icon: '🤝',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    title: 'Community Forum',
    desc: 'Engage in meaningful discussions, share success stories, ask questions, and learn from peers.',
    icon: '💬',
    color: 'bg-secondary-50 text-secondary-600',
  },
  {
    title: 'Resource Library',
    desc: 'Access a curated collection of articles, videos, templates, and guides for career growth.',
    icon: '📚',
    color: 'bg-accent-50 text-accent-600',
  },
  {
    title: 'Verified Experts',
    desc: 'Every mentor is manually reviewed and verified. You get guidance from real, accomplished professionals.',
    icon: '✅',
    color: 'bg-success-50 text-success-600',
  },
  {
    title: 'Safe & Inclusive',
    desc: 'A safe space built by and for the Dalit community, with strong moderation and community guidelines.',
    icon: '🛡️',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    title: 'Free to Join',
    desc: 'Core features are completely free. We believe access to mentorship should not be a privilege.',
    icon: '🎁',
    color: 'bg-secondary-50 text-secondary-600',
  },
];

// ── Main Component ─────────────────────────────────────────────────────────
const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO SECTION ══════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-neutral-900 via-primary-950 to-neutral-900 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-24 w-80 h-80 bg-secondary-600/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 right-1/3 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
          />
        </div>

        <div className="page-container relative py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-4 py-2 rounded-full border border-white/20 mb-8">
              <span className="w-1.5 h-1.5 bg-success-400 rounded-full animate-pulse" />
              Now live — Join 5,000+ community members
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.08] mb-6">
              Rise With the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                Right Mentor
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              {APP_NAME} connects Dalit students and professionals with expert mentors across
              tech, law, academia, civil services, and business — for free.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to={ROUTES.DASHBOARD} className="btn btn-primary btn-xl no-underline shadow-lg shadow-primary-900/50">
                  Go to Dashboard
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link to={ROUTES.REGISTER} className="btn btn-primary btn-xl no-underline shadow-lg shadow-primary-900/50">
                    Get Started Free
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link to={ROUTES.EXPLORE} className="btn btn-xl border-2 border-white/30 text-white hover:bg-white/10 no-underline backdrop-blur-sm">
                    Browse Mentors
                  </Link>
                </>
              )}
            </div>

            {/* Social proof */}
            <div className="mt-12 flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {['PA', 'RJ', 'SM', 'AP', 'KB'].map((initials) => (
                  <div key={initials} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 border-2 border-primary-900 flex items-center justify-center">
                    <span className="text-white text-2xs font-bold">{initials}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-sm">
                Joined by <span className="text-white font-semibold">5,000+</span> community members
              </p>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 0C480 0 240 60 0 30L0 60Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-14">
        <div className="page-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon }) => (
              <div key={label} className="text-center">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="text-3xl lg:text-4xl font-heading font-bold text-primary-600 mb-1">{value}</div>
                <div className="text-sm text-neutral-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════ */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="text-center mb-14">
            <span className="badge badge-primary mb-3">Why Udaan?</span>
            <h2 className="section-title">Everything you need to grow</h2>
            <p className="section-subtitle mx-auto">
              A complete platform for mentorship, community, and career growth — built specifically for the Dalit community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ title, desc, icon, color }) => (
              <div key={title} className="card-hover p-6">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-2xl mb-4`}>
                  {icon}
                </div>
                <h3 className="font-heading font-semibold text-neutral-900 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
      <section className="section-padding bg-neutral-50">
        <div className="page-container">
          <div className="text-center mb-14">
            <span className="badge badge-secondary mb-3">Simple Process</span>
            <h2 className="section-title">How Udaan works</h2>
            <p className="section-subtitle mx-auto">
              Get started in minutes. No complicated setup required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 z-0" />

            {HOW_IT_WORKS.map(({ step, title, desc, icon }, idx) => (
              <div key={step} className="relative z-10 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-card border-2 border-primary-100 flex items-center justify-center mx-auto mb-4 text-primary-600">
                  {icon}
                </div>
                <div className="text-xs font-bold text-primary-400 mb-1">STEP {step}</div>
                <h3 className="font-heading font-semibold text-neutral-900 mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURED MENTORS ══════════════════════════════════════════════ */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="badge badge-primary mb-3">Meet the Mentors</span>
              <h2 className="section-title">Learn from the best</h2>
              <p className="text-neutral-500 mt-2 max-w-xl">
                Our mentors are accomplished professionals who have walked the path and are ready to guide you.
              </p>
            </div>
            <Link to={ROUTES.EXPLORE} className="btn btn-outline shrink-0 no-underline">
              View All Mentors →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_MENTORS.map(({ id, name, role, expertise, sessions, rating, initials }) => (
              <Link
                key={id}
                to={`/experts/${id}`}
                className="card-hover p-5 no-underline group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">{initials}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors truncate">
                      {name}
                    </h3>
                    <p className="text-xs text-neutral-400 truncate mb-2">{role}</p>
                    <span className="badge badge-primary text-2xs">{expertise}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-1">
                    <span className="text-warning-500">⭐</span>
                    <span className="text-sm font-semibold text-neutral-800">{rating}</span>
                  </div>
                  <div className="text-xs text-neutral-400">
                    <span className="font-semibold text-neutral-700">{sessions}</span> sessions
                  </div>
                  <span className="text-xs text-success-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success-500 rounded-full" />
                    Available
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CATEGORIES ════════════════════════════════════════════════════ */}
      <section className="section-padding bg-neutral-50">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="section-title">Explore by expertise</h2>
            <p className="section-subtitle mx-auto">Find mentors in your field of interest</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {EXPERTISE_CATEGORIES.slice(0, 12).map(({ value, label }) => (
              <Link
                key={value}
                to={`${ROUTES.EXPLORE}?category=${value}`}
                className="px-5 py-2.5 bg-white border border-neutral-200 rounded-full text-sm font-medium text-neutral-700 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 no-underline"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════════════════════════ */}
      <section className="section-padding bg-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="badge badge-primary mb-3">Success Stories</span>
            <h2 className="section-title">Real people, real change</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, role, initials }) => (
              <div key={name} className="card p-6">
                <div className="text-primary-400 text-4xl font-heading leading-none mb-4">"</div>
                <p className="text-neutral-600 text-sm leading-relaxed mb-6 italic">{quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{name}</p>
                    <p className="text-xs text-neutral-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA SECTION ═══════════════════════════════════════════════════ */}
      <section className="section-padding bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="page-container relative text-center">
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mb-4">
            Your journey starts with one conversation.
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of Dalit students and professionals who are already building their future with Udaan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link to={ROUTES.EXPLORE} className="btn btn-xl bg-white text-primary-700 hover:bg-neutral-50 no-underline font-semibold">
                Find Your Mentor
              </Link>
            ) : (
              <>
                <Link to={ROUTES.REGISTER} className="btn btn-xl bg-white text-primary-700 hover:bg-neutral-50 no-underline font-semibold">
                  Join for Free
                </Link>
                <Link to={ROUTES.LOGIN} className="btn btn-xl border-2 border-white/40 text-white hover:bg-white/10 no-underline">
                  Sign In
                </Link>
              </>
            )}
          </div>
          <p className="mt-6 text-white/60 text-xs">Free forever. No credit card required.</p>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
