import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY, ROUTES } from '../constants';
import PageLoader from '../components/common/PageLoader';
import toast from 'react-hot-toast';

/**
 * OAuth Callback Page
 * Handles redirect after Google/LinkedIn OAuth authentication
 * The backend redirects here with token and user data in query params
 */
const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateUser } = useAuth();

  useEffect(() => {
    const handleCallback = () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');
      const userStr = searchParams.get('user');

      if (error) {
        toast.error(decodeURIComponent(error));
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

        if (userStr) {
          try {
            const user = JSON.parse(decodeURIComponent(userStr));
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            updateUser(user);

            // Redirect based on onboarding status
            if (!user.onboardingCompleted) {
              navigate(ROUTES.ROLE_SELECT, { replace: true });
            } else {
              navigate(ROUTES.DASHBOARD, { replace: true });
            }
          } catch {
            navigate(ROUTES.DASHBOARD, { replace: true });
          }
        } else {
          navigate(ROUTES.DASHBOARD, { replace: true });
        }

        toast.success('Welcome to Udaan!');
      } else {
        toast.error('Authentication failed. Please try again.');
        navigate(ROUTES.LOGIN, { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate, updateUser]);

  return <PageLoader message="Completing sign in..." />;
};

export default OAuthCallbackPage;
