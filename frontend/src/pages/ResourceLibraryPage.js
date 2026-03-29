import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, BookmarkIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { RESOURCE_TYPES } from '../constants';
import toast from 'react-hot-toast';

const typeIcons = { article: '📄', video: '🎥', pdf: '📕', tool: '🔧', course: '🎓', book: '📚', podcast: '🎙️', template: '📋', other: '📁' };

const ResourceCard = ({ resource }) => (
  <Link to={`/resources/${resource._id}`} className="block bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-purple-100 transition-all p-5">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
        {typeIcons[resource.type] || '📁'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-purple-600 font-medium capitalize">{resource.type}</span>
          {resource.isFeatured && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">⭐ Featured</span>}
        </div>
        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug">{resource.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{resource.description}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><ArrowDownTrayIcon className="w-3.5 h-3.5" />{resource.downloadCount || 0}</span>
          <span className="flex items-center gap-1"><HandThumbUpIcon className="w-3.5 h-3.5" />{resource.upvoteCount || 0}</span>
          <span className="flex items-center gap-1"><BookmarkIcon className="w-3.5 h-3.5" />{resource.bookmarks?.length || 0}</span>
          <span className="ml-auto capitalize">{resource.category?.replace('_', ' ')}</span>
        </div>
      </div>
    </div>
  </Link>
);

const ResourceLibraryPage = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort, page, limit: 12 };
      if (search) params.search = search;
      if (type) params.type = type;
      const res = await api.get('/resources', { params });
      setResources(res.data.data.resources);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load resources'); }
    finally { setLoading(false); }
  }, [search, type, sort, page]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-1">Resource Library</h1>
          <p className="text-purple-200">Curated guides, templates, and resources for your growth</p>
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchResources(); }} className="mt-5 flex gap-3 max-w-xl">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources..." className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none" />
            </div>
            <button type="submit" className="px-5 py-3 bg-white text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-colors">Search</button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => { setType(''); setPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!type ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>All Types</button>
          {RESOURCE_TYPES.map((rt) => (
            <button key={rt.value} onClick={() => { setType(rt.value); setPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${type === rt.value ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {rt.icon} {rt.label}
            </button>
          ))}
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="ml-auto px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="newest">Newest</option>
            <option value="popular">Most Downloaded</option>
            <option value="featured">Featured</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl p-5 animate-pulse h-32" />)}</div>
        ) : resources.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-gray-500">No resources found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resources.map((r) => <ResourceCard key={r._id} resource={r} />)}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
            <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {pagination.pages}</span>
            <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceLibraryPage;
