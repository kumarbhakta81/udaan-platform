import React from 'react';
import { APP_NAME } from '../../constants';

/**
 * Full-page loading spinner
 * Shown during initial auth check and lazy page loads
 */
const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50"
      role="status"
      aria-label="Loading page"
    >
      {/* Brand mark */}
      <div className="mb-6">
        <span className="text-2xl font-heading font-bold text-gradient">
          {APP_NAME}
        </span>
      </div>

      {/* Animated spinner */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-primary-100" />
        <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-primary-600 animate-spin absolute inset-0" />
      </div>

      {/* Message */}
      <p className="mt-4 text-sm text-neutral-400 animate-pulse">{message}</p>
    </div>
  );
};

/**
 * Inline loading spinner - used inside components/sections
 */
export const InlineLoader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-[3px]',
  };

  return (
    <div
      className={`rounded-full border-neutral-200 border-t-primary-600 animate-spin ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

/**
 * Section loader - centered spinner for a section
 */
export const SectionLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <InlineLoader size="lg" />
      <p className="text-sm text-neutral-400">{message}</p>
    </div>
  );
};

export default PageLoader;
