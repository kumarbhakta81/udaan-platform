import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';
import api from '../services/api';

const DashboardPage = () => {
  const { user, isExpert } = useAuth();
  const [requests, setRequests] = useState([]);
  const [experts, setExperts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [reqRes, notifRes] = await Promise.all([
          api.get('/mentorship', { params: { limit: 3, sort: '-createdAt' } }),
          api.get('/notifications', { params: { limit: 5 } }),
        ]);
        setRequests(reqRes.data.data.requests || []);
        setNotifications(notifRes.data.data.notifications || []);

        if (!isExpert) {
          const expertRes = await api.get('/experts', { params: { limit: 3, sort: 'rating' } });
          setExperts(expertRes.data.data.experts || []);
        }

        // Build simple stats from requests
        const all = reqRes.data.data.requests || [];
        setStats({
          pending: all.filter((r) => r.status === 'pending').length,
          active: all.filter((r) => r.status === 'accepted').length,
          completed: all.filter((r) => r.status === 'completed').length,
        });
      } catch {
        // fail silently — dashboard degrades gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [isExpert]);

  const statCards = isExpert
    ? [
        { label: 'Pending Requests', value: stats?.pending ?? '–', icon: '📬', color: 'text-yellow-600 bg-yellow-50' },
        { label: 'Active Mentees', value: stats?.active ?? '–', icon: '🤝', color: 'text-green-600 bg-green-50' },
        { label: 'Completed', value: stats?.completed ?? '–', icon: '✅', color: 'text-blue-600 bg-blue-50' },
      ]
    : [
        { label: 'Requests Sent', value: (stats?.pending ?? 0) + (stats?.active ?? 0) + (stats?.completed ?? 0), icon: '📤', color: 'text-purple-600 bg-purple-50' },
        { label: 'Active Mentorships', value: stats?.active ?? '–', icon: '🤝', color: 'text-green-600 bg-green-50' },
        { label: 'Completed', value: stats?.completed ?? '–', icon: '🎓', color: 'text-blue-600 bg-blue-50' },
      ];

  const quickActions = !isExpert
    ? [
        { label: 'Find Mentors', to: ROUTES.EXPLORE, icon: '🔍', desc: 'Browse expert mentors' },
        { label: 'My Requests', to: ROUTES.MY_REQUESTS, icon: '📋', desc: 'Track your requests' },
        { label: 'Browse Resources', to: ROUTES.RESOURCES, icon: '📚', desc: 'Learn and grow' },
      ]
    : [
        { label: 'View Requests', to: ROUTES.MY_REQUESTS, icon: '📬', desc: 'Pending requests' },
        { label: 'Community', to: ROUTES.FORUM, icon: '💬', desc: 'Engage with community' },
        { label: 'My Profile', to: ROUTES.MY_PROFILE, icon: '👤', desc: 'Update your profile' },
      ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-purple-200 text-sm">
          {isExpert
            ? 'You have mentorship requests waiting for your review.'
            : 'Continue your mentorship journey and connect with experts.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{loading ? '–' : value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map(({ label, to, icon, desc }) => (
          <Link key={to} to={to} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2 hover:border-purple-200 hover:shadow-md transition-all no-underline group">
            <span className="text-3xl">{icon}</span>
            <p className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{label}</p>
            <p className="text-xs text-gray-400">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests / Recommended mentors */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{isExpert ? 'Recent Requests' : 'Recommended Mentors'}</h3>
            <Link to={isExpert ? ROUTES.MY_REQUESTS : ROUTES.EXPLORE} className="text-xs text-purple-600 hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-28" />
                    <div className="h-2 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : isExpert ? (
            requests.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No requests yet</p>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 3).map((req) => (
                  <div key={req._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <img
                      src={req.seeker?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.seeker?.name || 'U')}&background=c844ed&color=fff&size=40`}
                      alt={req.seeker?.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{req.seeker?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{req.topic}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : req.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : (
            experts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                <Link to={ROUTES.EXPLORE} className="text-purple-600 hover:underline">Browse experts</Link>
              </p>
            ) : (
              <div className="space-y-3">
                {experts.slice(0, 3).map((exp) => (
                  <div key={exp._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <img
                      src={exp.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(exp.user?.name || 'E')}&background=c844ed&color=fff&size=40`}
                      alt={exp.user?.name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{exp.user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{exp.headline}</p>
                    </div>
                    <Link to={`/experts/${exp.user?._id}`} className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">View</Link>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Recent notifications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">🔔</p>
              <p className="text-sm text-gray-400">No activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Actions you take will show up here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n._id} className={`flex items-start gap-3 p-3 rounded-xl ${n.isRead ? '' : 'bg-purple-50'}`}>
                  <span className="text-xl mt-0.5">
                    {{ mentorship: '🤝', forum: '💬', resource: '📚', system: '🔔' }[n.type] || '🔔'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
