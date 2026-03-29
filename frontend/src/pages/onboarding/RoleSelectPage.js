import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';
import api from '../../services/api';
import toast from 'react-hot-toast';

const RoleSelectPage = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [selecting, setSelecting] = React.useState(null);

  const handleRoleSelect = async (role) => {
    setSelecting(role);
    try {
      await api.post('/auth/select-role', { role });
      updateUser({ role });
      if (role === 'seeker') {
        navigate(ROUTES.SEEKER_ONBOARDING);
      } else {
        navigate(ROUTES.EXPERT_ONBOARDING);
      }
    } catch (error) {
      toast.error('Could not set role. Please try again.');
      setSelecting(null);
    }
  };

  const roles = [
    {
      id: 'seeker',
      title: "I'm seeking mentorship",
      subtitle: 'Connect with expert mentors to guide your career',
      icon: '🎯',
      benefits: ['Find expert mentors', 'Get career guidance', 'Access resources', 'Join community'],
      color: 'from-primary-50 to-primary-100 border-primary-200 hover:border-primary-400',
      btnColor: 'btn-primary',
    },
    {
      id: 'expert',
      title: 'I want to mentor others',
      subtitle: 'Share your expertise and help the community grow',
      icon: '🌟',
      benefits: ['Share expertise', 'Give back', 'Build network', 'Create impact'],
      color: 'from-secondary-50 to-secondary-100 border-secondary-200 hover:border-secondary-400',
      btnColor: 'btn-secondary',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <span>Step 1 of 2</span>
            <div className="flex gap-1">
              <div className="w-4 h-1 bg-primary-600 rounded-full" />
              <div className="w-4 h-1 bg-primary-200 rounded-full" />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-3">
            How would you like to use Udaan?
          </h1>
          <p className="text-neutral-500">Choose your role to get started. You can always change this later.</p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roles.map(({ id, title, subtitle, icon, benefits, color, btnColor }) => (
            <div
              key={id}
              className={`bg-gradient-to-br ${color} border-2 rounded-2xl p-7 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover`}
              onClick={() => !selecting && handleRoleSelect(id)}
            >
              <div className="text-4xl mb-4">{icon}</div>
              <h2 className="text-xl font-heading font-bold text-neutral-900 mb-2">{title}</h2>
              <p className="text-sm text-neutral-500 mb-5">{subtitle}</p>
              <ul className="space-y-2 mb-6">
                {benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-neutral-700">
                    <svg className="w-4 h-4 text-success-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
              <button
                className={`btn ${btnColor} w-full`}
                disabled={!!selecting}
              >
                {selecting === id ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </span>
                ) : (
                  `Continue as ${id.charAt(0).toUpperCase() + id.slice(1)}`
                )}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-neutral-400 mt-6">
          You can update your role preference anytime from profile settings.
        </p>
      </div>
    </div>
  );
};

export default RoleSelectPage;
