import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Placeholder - Full multi-step form implementation in "User Onboarding Flow" step
const ExpertOnboardingPage = () => {
  const { updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await api.post('/users/onboarding/expert', { onboardingCompleted: true });
      updateUser({ onboardingCompleted: true, role: 'expert' });
      toast.success('Expert profile created! Welcome to Udaan 🌟');
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch {
      updateUser({ onboardingCompleted: true, role: 'expert' });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-secondary-50 text-secondary-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <span>Step 2 of 2</span>
            <div className="flex gap-1">
              <div className="w-4 h-1 bg-secondary-200 rounded-full" />
              <div className="w-4 h-1 bg-secondary-600 rounded-full" />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-3">Set Up Expert Profile</h1>
          <p className="text-neutral-500">Share your expertise to start mentoring and making an impact.</p>
        </div>

        <div className="card p-8">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-xl font-heading font-semibold text-neutral-800 mb-2">Expert Onboarding</h2>
            <p className="text-neutral-500 text-sm mb-6">
              Full multi-step onboarding form coming soon with expertise, skills, availability, and verification.
            </p>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="btn btn-secondary btn-lg w-full"
            >
              {loading ? 'Setting up...' : 'Complete Setup & Go to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertOnboardingPage;
