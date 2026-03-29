import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, StarIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { EXPERTISE_CATEGORIES } from '../constants';
import toast from 'react-hot-toast';

const ExpertCard = ({ expert }) => {
  const { user, headline, bio, expertiseCategories, stats, isAvailableForMentoring, isVerifiedExpert } = expert;
  const rating = stats?.averageRating || 0;
  const sessions = stats?.totalSessions || 0;

  return (
    <Link
      to={`/experts/${user?._id}`}
      className="block bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Expert')}&background=c844ed&color=fff&size=80`}
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            {isAvailableForMentoring && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" title="Available" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{user?.name}</h3>
              {isVerifiedExpert && (
                <CheckBadgeIcon className="w-4 h-4 text-purple-600 flex-shrink-0" title="Verified Expert" />
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">{headline || 'Expert Mentor'}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-sm text-yellow-600">
                <StarIcon className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                {rating > 0 ? rating.toFixed(1) : 'New'}
              </span>
              <span className="text-sm text-gray-400">{sessions} sessions</span>
            </div>
          </div>
        </div>

        {bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{bio}</p>
        )}

        {expertiseCategories?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {expertiseCategories.slice(0, 3).map((cat) => {
              const label = EXPERTISE_CATEGORIES.find((c) => c.value === cat)?.label || cat;
              return (
                <span key={cat} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                  {label}
                </span>
              );
            })}
            {expertiseCategories.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                +{expertiseCategories.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className={`text-xs font-medium ${isAvailableForMentoring ? 'text-green-600' : 'text-gray-400'}`}>
            {isAvailableForMentoring ? 'Available for mentoring' : 'Currently unavailable'}
          </span>
          <span className="text-xs text-purple-600 font-medium">View profile →</span>
        </div>
      </div>
    </Link>
  );
};

const ExploreExpertsPage = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort, page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (available) params.available = 'true';

      const res = await api.get('/experts', { params });
      setExperts(res.data.data.experts);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load experts');
    } finally {
      setLoading(false);
    }
  }, [search, category, available, sort, page]);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchExperts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Mentor</h1>
          <p className="text-purple-200">Connect with verified experts who understand your journey</p>

          <form onSubmit={handleSearch} className="mt-6 flex gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, skill, or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-white text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
          </button>

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="rating">Top Rated</option>
            <option value="sessions">Most Sessions</option>
            <option value="newest">Newest</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => { setAvailable(e.target.checked); setPage(1); }}
              className="rounded accent-purple-600"
            />
            Available now
          </label>

          {pagination && (
            <span className="ml-auto text-sm text-gray-500">{pagination.total} experts found</span>
          )}
        </div>

        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Filter by expertise</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setCategory(''); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${!category ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                All
              </button>
              {EXPERTISE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => { setCategory(cat.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${category === cat.value ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : experts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 text-lg">No experts found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {experts.map((expert) => (
              <ExpertCard key={expert._id} expert={expert} />
            ))}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
              Previous
            </button>
            {[...Array(Math.min(pagination.pages, 7))].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`px-4 py-2 rounded-lg text-sm ${page === i + 1 ? 'bg-purple-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreExpertsPage;
