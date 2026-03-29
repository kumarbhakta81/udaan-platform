import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../services/api';
import { ROUTES, VALIDATION } from '../constants';
import { InlineLoader } from '../components/common/PageLoader';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await api.post(`/auth/reset-password/${token}`, { password: data.password });
      toast.success('Password reset successfully! Please login.');
      navigate(ROUTES.LOGIN);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-bold text-neutral-900">Set new password</h2>
        <p className="text-neutral-500 text-sm mt-2">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="password" className="label">New password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters"
              className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: VALIDATION.PASSWORD_MIN_LENGTH, message: `At least ${VALIDATION.PASSWORD_MIN_LENGTH} characters` },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <p className="error-message">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Confirm password</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full btn-lg">
          {isSubmitting ? <InlineLoader size="sm" /> : 'Reset Password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        <Link to={ROUTES.LOGIN} className="font-medium text-primary-600">Back to Login</Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
