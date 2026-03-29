import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, CheckBadgeIcon, StarIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EXPERTISE_CATEGORIES } from '../constants';
import toast from 'react-hot-toast';

const MyProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me')
      .then((res) => setProfile(res.data.data.profile))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" /></div>;

  const completion = profile?.completionPercentage || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-purple-600 to-purple-800" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 flex-wrap gap-4">
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=c844ed&color=fff&size=96`} alt={user?.name} className="w-24 h-24 rounded-full border-4 border-white object-cover shadow" />
              <Link to="/profile/edit" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <PencilIcon className="w-4 h-4" /> Edit Profile
              </Link>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                {profile?.isVerifiedExpert && <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full"><CheckBadgeIcon className="w-3.5 h-3.5" /> Verified</span>}
              </div>
              <p className="text-gray-500 mt-0.5">{profile?.headline || 'Add a headline'}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="capitalize px-2.5 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">{user?.role}</span>
                {profile?.location?.city && <span>{profile.location.city}</span>}
                {profile?.stats?.averageRating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-600">
                    <StarIcon className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                    {profile.stats.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile completion */}
        {completion < 100 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Profile Completion</p>
              <p className="text-sm font-semibold text-purple-600">{completion}%</p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${completion}%` }} />
            </div>
            <Link to="/profile/edit" className="inline-block mt-3 text-sm text-purple-600 hover:underline">Complete your profile →</Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 mt-5">
          {profile?.bio && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-2">About</h2>
              <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {profile?.skills?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => <span key={s} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{s}</span>)}
              </div>
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
              <h2 className="font-semibold text-gray-900 mb-4">Work Experience</h2>
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

          {profile?.education?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4">Education</h2>
              <div className="space-y-3">
                {profile.education.map((edu, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-xs">🎓</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{edu.degree} in {edu.fieldOfStudy}</p>
                      <p className="text-sm text-gray-500">{edu.institution}</p>
                      {edu.year && <p className="text-xs text-gray-400">{edu.year}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
