import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { MENTORSHIP_TOPICS } from '../constants';
import toast from 'react-hot-toast';

const RequestMentorshipPage = () => {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    api.get(`/experts/${expertId}`)
      .then((res) => { setExpert(res.data.data.user); setProfile(res.data.data.profile); })
      .catch(() => { toast.error('Expert not found'); navigate('/explore'); })
      .finally(() => setLoading(false));
  }, [expertId, navigate]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/mentorship', { expertId, ...data });
      toast.success('Mentorship request sent!');
      navigate('/requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        {expert && (
          <div className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <img src={expert.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=c844ed&color=fff&size=60`} alt={expert.name} className="w-14 h-14 rounded-full object-cover" />
            <div>
              <p className="text-sm text-gray-500">Sending request to</p>
              <p className="font-semibold text-gray-900">{expert.name}</p>
              <p className="text-sm text-gray-500">{profile?.headline}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Request Mentorship</h1>
          <p className="text-sm text-gray-500 mb-6">Tell the expert about yourself and how they can help</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
              <select {...register('topic', { required: 'Please select a topic' })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">Select a topic...</option>
                {MENTORSHIP_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your message *</label>
              <textarea
                {...register('message', { required: 'Please write a message', minLength: { value: 30, message: 'At least 30 characters' } })}
                rows={5}
                placeholder="Introduce yourself, describe your situation, and explain specifically how this expert can help you..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your goals (optional)</label>
              <textarea
                {...register('goals')}
                rows={3}
                placeholder="What specific outcomes are you hoping to achieve from this mentorship?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred meeting type</label>
              <select {...register('preferredMeetingType')} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="any">Any</option>
                <option value="video">Video call</option>
                <option value="audio">Audio call</option>
                <option value="chat">Chat only</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60">
                {submitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestMentorshipPage;
