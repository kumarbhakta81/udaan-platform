import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { FORUM_CATEGORIES } from '../constants';
import toast from 'react-hot-toast';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim()) && tags.length < 5) setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await api.post('/forum', { ...data, tags });
      toast.success('Post published!');
      navigate(`/forum/${res.data.data.post.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a Post</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select {...register('category', { required: 'Select a category' })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Choose category...</option>
              {FORUM_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              {...register('title', { required: 'Title is required', minLength: { value: 10, message: 'At least 10 characters' }, maxLength: { value: 150, message: 'Max 150 characters' } })}
              placeholder="Ask a question or start a discussion..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              {...register('content', { required: 'Content is required', minLength: { value: 20, message: 'At least 20 characters' } })}
              rows={8}
              placeholder="Share your thoughts, question, or story in detail..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (optional, max 5)</label>
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Add a tag and press Enter" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    #{t}
                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="text-gray-400 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/forum')} className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60">
              {submitting ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
