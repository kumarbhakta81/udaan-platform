import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';
import { InlineLoader } from '../components/common/PageLoader';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success('Welcome back!');
      if (!result.user?.onboardingCompleted) {
        navigate(ROUTES.ROLE_SELECT, { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      toast.error(result.error);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/${provider}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-bold text-neutral-900">Welcome back</h2>
        <p className="text-neutral-500 text-sm mt-2">Sign in to continue your journey on Udaan</p>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => handleOAuth('google')}
          className="btn btn-outline w-full justify-center gap-3 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        <button
          onClick={() => handleOAuth('linkedin')}
          className="btn btn-outline w-full justify-center gap-3 border-neutral-300 text-neutral-700 hover:bg-neutral-50"
        >
          <svg className="w-5 h-5 text-[#0077B5]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Continue with LinkedIn
        </button>
      </div>

      <div className="divider mb-6">or</div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="label">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={`input ${errors.email ? 'input-error' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
            })}
          />
          {errors.email && <p className="error-message">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="label mb-0">Password</label>
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Your password"
              className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                }
              </svg>
            </button>
          </div>
          {errors.password && <p className="error-message">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full btn-lg">
          {isSubmitting ? <InlineLoader size="sm" /> : 'Login'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Don't have an account?{' '}
        <Link to={ROUTES.REGISTER} className="font-semibold text-primary-600">Create account</Link>
      </p>
    </div>
  );
};

export default LoginPage;
