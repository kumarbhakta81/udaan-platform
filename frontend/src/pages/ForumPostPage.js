import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HandThumbUpIcon, FlagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ForumPostPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/forum/${id}`)
      .then((res) => setPost(res.data.data.post))
      .catch(() => { toast.error('Post not found'); navigate('/forum'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleUpvote = async () => {
    if (!isAuthenticated) { toast.error('Please login to upvote'); return; }
    try {
      const res = await api.post(`/forum/${post._id}/upvote`);
      setPost((p) => ({ ...p, upvoteCount: res.data.data.upvoteCount }));
    } catch { toast.error('Failed to upvote'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/forum/${post._id}/comment`, { content: comment });
      setPost((p) => ({ ...p, comments: [...(p.comments || []), res.data.data.comment], commentCount: (p.commentCount || 0) + 1 }));
      setComment('');
      toast.success('Comment added');
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmitting(false); }
  };

  const handleReport = async () => {
    if (!isAuthenticated) return;
    try {
      await api.post(`/forum/${post._id}/report`, { reason: 'Inappropriate content' });
      toast.success('Post reported');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to report');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" /></div>;
  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/forum" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-5">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Forum
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=c844ed&color=fff&size=40`} alt={post.author?.name} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <p className="font-medium text-gray-900">{post.author?.name}</p>
              <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <span className="ml-auto text-xs capitalize px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">{post.category?.replace('_', ' ')}</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="text-gray-600 leading-relaxed whitespace-pre-line">{post.content}</div>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
              {post.tags.map((tag) => <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">#{tag}</span>)}
            </div>
          )}

          <div className="flex items-center gap-4 mt-5 pt-5 border-t border-gray-100">
            <button onClick={handleUpvote} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors">
              <HandThumbUpIcon className="w-4 h-4" /> {post.upvoteCount || 0} upvotes
            </button>
            <span className="text-sm text-gray-400">{post.commentCount || 0} comments</span>
            <button onClick={handleReport} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <FlagIcon className="w-3.5 h-3.5" /> Report
            </button>
          </div>
        </article>

        {/* Comments */}
        <div className="mt-6">
          <h2 className="font-semibold text-gray-900 mb-4">{post.comments?.length || 0} Comments</h2>

          {isAuthenticated && (
            <form onSubmit={handleComment} className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
              <div className="flex gap-3">
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=c844ed&color=fff&size=36`} alt={user?.name} className="w-9 h-9 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Write a thoughtful reply..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
                  <button type="submit" disabled={submitting || !comment.trim()} className="mt-2 px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {post.comments?.filter((c) => !c.deletedAt).map((c) => (
              <div key={c._id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <img src={c.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author?.name || 'U')}&background=c844ed&color=fff&size=32`} alt={c.author?.name} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-sm font-medium text-gray-900">{c.author?.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600">{c.content}</p>
              </div>
            ))}
          </div>

          {!isAuthenticated && (
            <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500 text-sm mb-3">Join the conversation</p>
              <Link to="/login" className="px-5 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700">Login to Comment</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumPostPage;
