import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Main Layout - wraps public-facing pages (Home, Explore, Forum, etc.)
 * Includes Navbar at top and Footer at bottom
 */
const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* pt-16 accounts for fixed navbar height */}
      <main className="flex-1 pt-16" id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
