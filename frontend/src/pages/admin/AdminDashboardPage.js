import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}>{icon}</div>
    <p className="text-2xl font-bold text-gray-900">{value ?? '–'}</p>
    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
  </div>
);

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load admin dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />)}
      </div>
    </div>
  );

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform overview and quick actions</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="bg-purple-50 text-purple-600" />
        <StatCard icon="🧑‍💼" label="Experts" value={stats.totalExperts} color="bg-blue-50 text-blue-600" />
        <StatCard icon="🤝" label="Mentorship Requests" value={stats.totalMentorships} color="bg-green-50 text-green-600" />
        <StatCard icon="📝" label="Forum Posts" value={stats.totalPosts} color="bg-yellow-50 text-yellow-600" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon="⏳" label="Pending Verifications" value={stats.pendingVerifications} color="bg-orange-50 text-orange-600" />
        <StatCard icon="🚨" label="Reported Posts" value={stats.reportedPosts} color="bg-red-50 text-red-600" />
        <StatCard icon="📚" label="Resources" value={stats.totalResources} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon="💬" label="Messages" value={stats.totalMessages} color="bg-teal-50 text-teal-600" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Manage Users', to: '/admin/users', icon: '👥', desc: 'View, ban, or deactivate users' },
          { label: 'Moderation', to: '/admin/moderation', icon: '🚨', desc: 'Review reported content' },
          { label: 'Analytics', to: '/admin/analytics', icon: '📊', desc: 'Platform growth metrics' },
        ].map(({ label, to, icon, desc }) => (
          <Link key={to} to={to} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-purple-200 hover:shadow-md transition-all no-underline group">
            <span className="text-3xl">{icon}</span>
            <p className="font-semibold text-gray-900 group-hover:text-purple-600 mt-2 transition-colors">{label}</p>
            <p className="text-xs text-gray-400 mt-1">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent users */}
      {data?.recentUsers?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Signups</h3>
            <Link to="/admin/users" className="text-xs text-purple-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {data.recentUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-3">
                <img
                  src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=c844ed&color=fff&size=36`}
                  alt={u.name}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <span className="text-xs capitalize px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">{u.role}</span>
                <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
