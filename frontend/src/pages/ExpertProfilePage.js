import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StarIcon, CheckBadgeIcon, ChatBubbleLeftIcon, CalendarDaysIcon, LanguageIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EXPERTISE_CATEGORIES } from '../constants';
import toast from 'react-hot-toast';

const ExpertProfilePage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/experts/${id}`)
      .then((res) => { setExpert(res.data.data.user); setProfile(res.data.data.profile); })
      .catch(() => { toast.error('Expert not found'); navigate('/explore'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" /></div>;
  if (!expert) return null;

  const rating = profile?.stats?.averageRating || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-purple-600 to-purple-800" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <img src={expert.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=c844ed&color=fff&size=96`} alt={expert.name} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{expert.name}</h1>
                  {profile?.isVerifiedExpert && <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"><CheckBadgeIcon className="w-3.5 h-3.5" /> Verified</span>}
                </div>
                <p className="text-gray-500 mt-0.5">{profile?.headline}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  {rating > 0 && <span className="flex items-center gap-1 text-yellow-600"><StarIcon className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />{rating.toFixed(1)}</span>}
                  <span>{profile?.stats?.totalSessions || 0} sessions</span>
                  {profile?.location?.city && <span>{profile.location.city}</span>}
                </div>
              </div>
              {isAuthenticated && user?._id !== id && (
                <Link to={`/request/${id}`} className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors">Request Mentorship</Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            {profile?.bio && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}
            {profile?.expertiseCategories?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-3">Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.expertiseCategories.map((cat) => {
                    const label = EXPERTISE_CATEGORIES.find((c) => c.value === cat)?.label || cat;
                    return <span key={cat} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">{label}</span>;
                  })}
                </div>
              </div>
            )}
            {profile?.workExperience?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-4">Experience</h2>
                <div className="space-y-4">
                  {profile.workExperience.map((exp, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 text-xs font-bold">{exp.company?.[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{exp.title}</p>
                        <p className="text-sm text-gray-500">{exp.company}</p>
                        <p className="text-xs text-gray-400">{exp.startDate ? new Date(exp.startDate).getFullYear() : ''} — {exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4">Mentoring Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 text-purple-500" />
                  {profile?.isAvailableForMentoring ? <span className="text-green-600 font-medium">Available</span> : <span className="text-gray-400">Unavailable</span>}
                </div>
                {profile?.sessionDuration && <div className="flex items-center gap-2 text-gray-600"><ChatBubbleLeftIcon className="w-4 h-4 text-purple-500" /><span>{profile.sessionDuration} min sessions</span></div>}
                {profile?.languages?.length > 0 && <div className="flex items-center gap-2 text-gray-600"><LanguageIcon className="w-4 h-4 text-purple-500" /><span>{profile.languages.join(', ')}</span></div>}
                {profile?.yearsOfExperience && <div className="text-gray-600"><span className="font-medium">{profile.yearsOfExperience}+</span> years exp.</div>}
              </div>
            </div>
            {profile?.mentoringTopics?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-3">Can help with</h2>
                <ul className="space-y-2">{profile.mentoringTopics.map((t) => <li key={t} className="text-sm text-gray-600 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />{t}</li>)}</ul>
              </div>
            )}
            {isAuthenticated && user?._id !== id && (
              <Link to={`/request/${id}`} className="block w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors text-center">Request Mentorship</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertProfilePage;
