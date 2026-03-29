import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowDownTrayIcon, HandThumbUpIcon, BookmarkIcon, ArrowLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ResourceDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/resources/${id}`)
      .then((res) => setResource(res.data.data.resource))
      .catch(() => { toast.error('Resource not found'); navigate('/resources'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDownload = async () => {
    if (!isAuthenticated) { toast.error('Please login to download'); return; }
    try {
      const res = await api.get(`/resources/${id}/download`);
      const url = res.data.data.url;
      if (url) window.open(url, '_blank');
      setResource((r) => ({ ...r, downloadCount: (r.downloadCount || 0) + 1 }));
    } catch { toast.error('Download failed'); }
  };

  const handleUpvote = async () => {
    if (!isAuthenticated) { toast.error('Please login to upvote'); return; }
    try {
      const res = await api.post(`/resources/${id}/upvote`);
      setResource((r) => ({ ...r, upvoteCount: res.data.data.upvoteCount }));
    } catch { toast.error('Failed to upvote'); }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast.error('Please login to bookmark'); return; }
    try {
      const res = await api.post(`/resources/${id}/bookmark`);
      toast.success(res.data.data.bookmarked ? 'Bookmarked!' : 'Bookmark removed');
    } catch { toast.error('Failed to bookmark'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" /></div>;
  if (!resource) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/resources" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Library
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              {{ article: '📄', video: '🎥', pdf: '📕', tool: '🔧', course: '🎓', book: '📚', podcast: '🎙️', template: '📋' }[resource.type] || '📁'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-purple-600 font-medium capitalize">{resource.type}</span>
                <span className="text-xs text-gray-400 capitalize">· {resource.category?.replace('_', ' ')}</span>
                {resource.difficultyLevel && resource.difficultyLevel !== 'all' && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{resource.difficultyLevel}</span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{resource.title}</h1>
              {resource.uploadedBy && (
                <p className="text-sm text-gray-500 mt-1">by {resource.uploadedBy.name}</p>
              )}
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed mt-5">{resource.description}</p>

          {resource.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {resource.tags.map((tag) => <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">#{tag}</span>)}
            </div>
          )}

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
            <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors text-sm">
              <ArrowDownTrayIcon className="w-4 h-4" />
              {resource.externalUrl ? 'Open Resource' : 'Download'}
            </button>
            {resource.externalUrl && (
              <a href={resource.externalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                <ArrowTopRightOnSquareIcon className="w-4 h-4" /> Visit Link
              </a>
            )}
            <button onClick={handleUpvote} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              <HandThumbUpIcon className="w-4 h-4" /> {resource.upvoteCount || 0}
            </button>
            <button onClick={handleBookmark} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              <BookmarkIcon className="w-4 h-4" /> Save
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 text-center">
            <div><p className="text-2xl font-bold text-gray-900">{resource.downloadCount || 0}</p><p className="text-xs text-gray-500 mt-0.5">Downloads</p></div>
            <div><p className="text-2xl font-bold text-gray-900">{resource.viewCount || 0}</p><p className="text-xs text-gray-500 mt-0.5">Views</p></div>
            <div><p className="text-2xl font-bold text-gray-900">{resource.upvoteCount || 0}</p><p className="text-xs text-gray-500 mt-0.5">Upvotes</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailPage;
