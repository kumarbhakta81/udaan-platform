import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminModerationPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    api.get('/admin/moderation/posts')
      .then((res) => setPosts(res.data.data.posts || []))
      .catch(() => toast.error('Failed to load reported posts'))
      .finally(() => setLoading(false));
  }, []);

  const moderate = async (postId, action) => {
    setActionId(postId);
    try {
      await api.put(`/admin/moderation/posts/${postId}`, { action });
      toast.success(action === 'remove' ? 'Post removed' : 'Post cleared');
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch {
      toast.error('Moderation action failed');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and moderate reported forum posts</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-gray-100" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-16">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-gray-500 font-medium">No reported posts</p>
          <p className="text-sm text-gray-400 mt-1">The community is behaving well</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      {post.reports?.length || 0} report{(post.reports?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{post.category?.replace('_', ' ')}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <img
                      src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=c844ed&color=fff&size=28`}
                      alt={post.author?.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-500">by {post.author?.name}</span>
                    <span className="text-xs text-gray-400">· {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  {post.reports?.length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-xl">
                      <p className="text-xs font-medium text-red-700 mb-1">Report reasons:</p>
                      <ul className="space-y-1">
                        {post.reports.slice(0, 3).map((r, i) => (
                          <li key={i} className="text-xs text-red-600">• {r.reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => moderate(post._id, 'remove')}
                    disabled={actionId === post._id}
                    className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Remove Post
                  </button>
                  <button
                    onClick={() => moderate(post._id, 'clear')}
                    disabled={actionId === post._id}
                    className="px-4 py-2 border border-gray-300 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Clear Reports
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminModerationPage;
