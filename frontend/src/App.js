import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ROUTES, ROLES } from './constants';

// ── Layout Components (eagerly loaded) ────────────────────────────────────
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';
import PageLoader from './components/common/PageLoader';

// ── Lazily Loaded Pages ────────────────────────────────────────────────────
// Public pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));

// Onboarding
const RoleSelectPage = lazy(() => import('./pages/onboarding/RoleSelectPage'));
const SeekerOnboardingPage = lazy(() => import('./pages/onboarding/SeekerOnboardingPage'));
const ExpertOnboardingPage = lazy(() => import('./pages/onboarding/ExpertOnboardingPage'));

// Core app pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ExploreExpertsPage = lazy(() => import('./pages/ExploreExpertsPage'));
const ExpertProfilePage = lazy(() => import('./pages/ExpertProfilePage'));
const RequestMentorshipPage = lazy(() => import('./pages/RequestMentorshipPage'));
const MyRequestsPage = lazy(() => import('./pages/MyRequestsPage'));
const MyProfilePage = lazy(() => import('./pages/MyProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));

// Community
const ForumPage = lazy(() => import('./pages/ForumPage'));
const ForumPostPage = lazy(() => import('./pages/ForumPostPage'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));

// Resources
const ResourceLibraryPage = lazy(() => import('./pages/ResourceLibraryPage'));
const ResourceDetailPage = lazy(() => import('./pages/ResourceDetailPage'));

// Messages
const MessagesPage = lazy(() => import('./pages/MessagesPage'));

// Settings
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Admin
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminModerationPage = lazy(() => import('./pages/admin/AdminModerationPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));

// Error pages
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const OAuthCallbackPage = lazy(() => import('./pages/OAuthCallbackPage'));

// ── Route Guards ───────────────────────────────────────────────────────────

/**
 * ProtectedRoute: Requires authentication
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

/**
 * PublicOnlyRoute: Redirects authenticated users away from auth pages
 */
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();

  if (isLoading) return <PageLoader />;
  if (isAuthenticated) {
    return <Navigate to={needsOnboarding ? ROUTES.ROLE_SELECT : ROUTES.DASHBOARD} replace />;
  }

  return children;
};

/**
 * OnboardingRoute: Only accessible if authenticated but not onboarded
 */
const OnboardingRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user?.onboardingCompleted) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return children;
};

/**
 * AdminRoute: Only for admins
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user?.role !== ROLES.ADMIN) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return children;
};

// ── App Router ─────────────────────────────────────────────────────────────
const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public Routes (with main layout) ─────────── */}
        <Route element={<MainLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.EXPLORE} element={<ExploreExpertsPage />} />
          <Route path={ROUTES.EXPERT_PROFILE} element={<ExpertProfilePage />} />
          <Route path={ROUTES.FORUM} element={<ForumPage />} />
          <Route path={ROUTES.FORUM_POST} element={<ForumPostPage />} />
          <Route path={ROUTES.RESOURCES} element={<ResourceLibraryPage />} />
          <Route path={ROUTES.RESOURCE_DETAIL} element={<ResourceDetailPage />} />
        </Route>

        {/* ── Auth Routes (with auth layout, redirect if logged in) ── */}
        <Route element={<AuthLayout />}>
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallbackPage />} />
        </Route>

        {/* ── Onboarding Routes ─────────────────────────── */}
        <Route
          path={ROUTES.ROLE_SELECT}
          element={
            <OnboardingRoute>
              <RoleSelectPage />
            </OnboardingRoute>
          }
        />
        <Route
          path={ROUTES.SEEKER_ONBOARDING}
          element={
            <OnboardingRoute>
              <SeekerOnboardingPage />
            </OnboardingRoute>
          }
        />
        <Route
          path={ROUTES.EXPERT_ONBOARDING}
          element={
            <OnboardingRoute>
              <ExpertOnboardingPage />
            </OnboardingRoute>
          }
        />

        {/* ── Protected Routes (with dashboard layout) ──── */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.MY_PROFILE} element={<MyProfilePage />} />
          <Route path={ROUTES.EDIT_PROFILE} element={<EditProfilePage />} />
          <Route path={ROUTES.REQUEST_MENTORSHIP} element={<RequestMentorshipPage />} />
          <Route path={ROUTES.MY_REQUESTS} element={<MyRequestsPage />} />
          <Route path={ROUTES.CREATE_POST} element={<CreatePostPage />} />
          <Route path={ROUTES.MESSAGES} element={<MessagesPage />} />
          <Route path={ROUTES.MESSAGE_THREAD} element={<MessagesPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>

        {/* ── Admin Routes ──────────────────────────────── */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path={ROUTES.ADMIN} element={<AdminDashboardPage />} />
          <Route path={ROUTES.ADMIN_USERS} element={<AdminUsersPage />} />
          <Route path={ROUTES.ADMIN_MODERATION} element={<AdminModerationPage />} />
          <Route path={ROUTES.ADMIN_ANALYTICS} element={<AdminAnalyticsPage />} />
        </Route>

        {/* ── 404 ───────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

// ── Main App Component ─────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRouter />
        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              fontSize: '14px',
              borderRadius: '12px',
              padding: '12px 16px',
              maxWidth: '380px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f9fafb',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f9fafb',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
