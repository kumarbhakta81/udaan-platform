import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HandThumbUpIcon, ChatBubbleLeftIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FORUM_CATEGORIES } from '../constants';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => (
  <Link to={`/forum/${post.slug}`} className="block bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-purple-100 transition-all p-5">
    {post.isPinned && <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full mb-2 inline-block">📌 Pinned</span>}
    <div className="flex items-start gap-3">
      <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=c844ed&color=fff&size=40`} alt={post.author?.name} className="w-9 h-9 rounded-full flex-shrink-0 object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{post.author?.name} · {new Date(post.createdAt).toLocaleDateString()}</p>
        <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug">{post.title}</h3>
        {post.excerpt && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><HandThumbUpIcon className="w-3.5 h-3.5" />{post.upvoteCount || 0}</span>
          <span className="flex items-center gap-1"><ChatBubbleLeftIcon className="w-3.5 h-3.5" />{post.commentCount || 0}</span>
          <span className="flex items-center gap-1"><EyeIcon className="w-3.5 h-3.5" />{post.views || 0}</span>
          {post.category && <span className="ml-auto capitalize px-2 py-0.5 bg-gray-100 rounded-full">{post.category.replace('_', ' ')}</span>}
        </div>
      </div>
    </div>
  </Link>
);

const ForumPage = () => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort, page, limit: 15 };
      if (category) params.category = category;
      const res = await api.get('/forum', { params });
      setPosts(res.data.data.posts);
      setPagination(res.data.data.pagination);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }, [category, sort, page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Community Forum</h1>
            <p className="text-purple-200">Ask questions, share stories, and grow together</p>
          </div>
          {isAuthenticated && (
            <Link to="/forum/create" className="flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-colors">
              <PlusIcon className="w-4 h-4" /> New Post
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => { setCategory(''); setPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!category ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>All</button>
          {FORUM_CATEGORIES.map((cat) => (
            <button key={cat.value} onClick={() => { setCategory(cat.value); setPage(1); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${category === cat.value ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {cat.label}
            </button>
          ))}
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="ml-auto px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="newest">Newest</option>
            <option value="popular">Most Upvoted</option>
            <option value="active">Most Active</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl p-5 animate-pulse h-24" />)}</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-500">No posts yet in this category</p>
            {isAuthenticated && <Link to="/forum/create" className="inline-block mt-4 px-5 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700">Start a Discussion</Link>}
          </div>
        ) : (
          <div className="space-y-3">{posts.map((post) => <PostCard key={post._id} post={post} />)}</div>
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

export default ForumPage;
