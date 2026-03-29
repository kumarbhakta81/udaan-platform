import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-heading font-bold text-gradient mb-4">404</div>
        <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-3">Page not found</h1>
        <p className="text-neutral-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to={ROUTES.HOME} className="btn btn-primary">Go Home</Link>
          <button onClick={() => window.history.back()} className="btn btn-outline">Go Back</button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
