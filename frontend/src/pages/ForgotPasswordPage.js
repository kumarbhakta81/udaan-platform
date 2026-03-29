import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../services/api';
import { ROUTES } from '../constants';
import { InlineLoader } from '../components/common/PageLoader';

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-heading font-bold text-neutral-900 mb-2">Check your email</h2>
        <p className="text-neutral-500 text-sm mb-6">
          We sent a password reset link to <strong>{submittedEmail}</strong>
        </p>
        <p className="text-xs text-neutral-400 mb-6">
          Didn't receive it? Check your spam folder or{' '}
          <button onClick={() => setSubmitted(false)} className="text-primary-600 hover:underline">
            try again
          </button>
        </p>
        <Link to={ROUTES.LOGIN} className="btn btn-outline w-full no-underline">Back to Login</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-bold text-neutral-900">Forgot password?</h2>
        <p className="text-neutral-500 text-sm mt-2">
          Enter your email and we'll send you a reset link.
        </p>
      </div>

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
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
            })}
          />
          {errors.email && <p className="error-message">{errors.email.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full btn-lg">
          {isSubmitting ? <InlineLoader size="sm" /> : 'Send Reset Link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Remember your password?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-primary-600">Login</Link>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
