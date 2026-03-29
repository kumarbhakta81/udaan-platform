import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EXPERTISE_CATEGORIES, LANGUAGES } from '../constants';
import toast from 'react-hot-toast';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    api.get('/users/me').then((res) => {
      const p = res.data.data.profile;
      if (p) {
        reset({
          headline: p.headline || '',
          bio: p.bio || '',
          city: p.location?.city || '',
          state: p.location?.state || '',
          yearsOfExperience: p.yearsOfExperience || '',
          isAvailableForMentoring: p.isAvailableForMentoring || false,
          sessionDuration: p.sessionDuration || 60,
          maxMenteesPerMonth: p.maxMenteesPerMonth || 3,
          careerGoals: p.careerGoals || '',
          currentStatus: p.currentStatus || '',
        });
        setSelectedExpertise(p.expertiseCategories || []);
        setSelectedLanguages(p.languages || []);
        setSkills(p.skills || []);
      }
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const toggleExpertise = (val) => setSelectedExpertise((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
  const toggleLanguage = (val) => setSelectedLanguages((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await api.put('/users/me/profile', {
        headline: data.headline,
        bio: data.bio,
        location: { city: data.city, state: data.state },
        expertiseCategories: selectedExpertise,
        languages: selectedLanguages,
        skills,
        yearsOfExperience: data.yearsOfExperience,
        isAvailableForMentoring: data.isAvailableForMentoring,
        sessionDuration: Number(data.sessionDuration),
        maxMenteesPerMonth: Number(data.maxMenteesPerMonth),
        careerGoals: data.careerGoals,
        currentStatus: data.currentStatus,
      });
      toast.success('Profile updated!');
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
          <button onClick={() => navigate('/profile')} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900">Basic Info</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
              <input {...register('headline')} placeholder="e.g. Senior Software Engineer at Google" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea {...register('bio')} rows={4} placeholder="Tell your story..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input {...register('city')} placeholder="Mumbai" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input {...register('state')} placeholder="Maharashtra" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900">Skills</h2>
            <div>
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="Type a skill and press Enter" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((s) => (
                  <span key={s} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {s}
                    <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="text-gray-400 hover:text-red-500 ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {user?.role === 'expert' && (
            <>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h2 className="font-semibold text-gray-900">Expertise Areas</h2>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE_CATEGORIES.map((cat) => (
                    <button key={cat.value} type="button" onClick={() => toggleExpertise(cat.value)} className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedExpertise.includes(cat.value) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h2 className="font-semibold text-gray-900">Mentoring Preferences</h2>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="available" {...register('isAvailableForMentoring')} className="rounded accent-purple-600 w-4 h-4" />
                  <label htmlFor="available" className="text-sm text-gray-700">Available for mentoring</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session duration (min)</label>
                    <select {...register('sessionDuration')} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                      <option value={90}>90 min</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max mentees/month</label>
                    <input type="number" min={1} max={20} {...register('maxMenteesPerMonth')} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of experience</label>
                  <input type="number" min={0} {...register('yearsOfExperience')} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </>
          )}

          {user?.role === 'seeker' && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h2 className="font-semibold text-gray-900">Your Journey</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                <select {...register('currentStatus')} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Select...</option>
                  <option value="student">Student</option>
                  <option value="job_seeker">Job Seeker</option>
                  <option value="employed">Employed</option>
                  <option value="entrepreneur">Entrepreneur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Career Goals</label>
                <textarea {...register('careerGoals')} rows={3} placeholder="What do you want to achieve?" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button key={lang.value} type="button" onClick={() => toggleLanguage(lang.label)} className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedLanguages.includes(lang.label) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
