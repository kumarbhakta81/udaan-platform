import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MetricBar = ({ label, value, max, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%` }} />
    </div>
  </div>
);

const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />)}
      </div>
      <div className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
    </div>
  );

  const overview = data?.overview || {};
  const mentorshipStats = data?.mentorshipStats || {};
  const topExperts = data?.topExperts || [];
  const topResources = data?.topResources || [];
  const userGrowth = data?.userGrowth || [];

  const maxGrowth = userGrowth.length > 0 ? Math.max(...userGrowth.map((g) => g.count || 0)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform growth and engagement metrics</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: '👥', label: 'Total Users', value: overview.totalUsers, color: 'bg-purple-50 text-purple-600' },
          { icon: '🤝', label: 'Total Mentorships', value: overview.totalMentorships, color: 'bg-green-50 text-green-600' },
          { icon: '📝', label: 'Forum Posts', value: overview.totalPosts, color: 'bg-blue-50 text-blue-600' },
          { icon: '📚', label: 'Resources', value: overview.totalResources, color: 'bg-yellow-50 text-yellow-600' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{value ?? '–'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentorship breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-5">Mentorship Status Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'Pending', key: 'pending', color: 'bg-yellow-400' },
              { label: 'Accepted (Active)', key: 'accepted', color: 'bg-green-400' },
              { label: 'Completed', key: 'completed', color: 'bg-blue-400' },
              { label: 'Declined', key: 'declined', color: 'bg-red-400' },
              { label: 'Cancelled', key: 'cancelled', color: 'bg-gray-400' },
            ].map(({ label, key, color }) => (
              <MetricBar
                key={key}
                label={label}
                value={mentorshipStats[key] || 0}
                max={overview.totalMentorships || 1}
                color={color}
              />
            ))}
          </div>
        </div>

        {/* User growth */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-5">User Signups (Last 30 Days)</h3>
          {userGrowth.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {userGrowth.slice(-10).map((g) => (
                <MetricBar
                  key={g._id}
                  label={g._id}
                  value={g.count || 0}
                  max={maxGrowth}
                  color="bg-purple-400"
                />
              ))}
            </div>
          )}
        </div>

        {/* Top experts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Experts</h3>
          {topExperts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topExperts.map((exp, i) => (
                <div key={exp._id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-5">#{i + 1}</span>
                  <img
                    src={exp.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(exp.user?.name || 'E')}&background=c844ed&color=fff&size=32`}
                    alt={exp.user?.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{exp.user?.name}</p>
                    <p className="text-xs text-gray-400">{exp.totalRequests || 0} requests · ⭐ {(exp.averageRating || 0).toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top resources */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Most Downloaded Resources</h3>
          {topResources.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topResources.map((res, i) => (
                <div key={res._id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-5">#{i + 1}</span>
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-base flex-shrink-0">
                    {{ article: '📄', video: '🎥', pdf: '📕', tool: '🔧', course: '🎓', book: '📚', podcast: '🎙️', template: '📋' }[res.type] || '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{res.title}</p>
                    <p className="text-xs text-gray-400">{res.downloadCount || 0} downloads · {res.upvoteCount || 0} upvotes</p>
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

export default AdminAnalyticsPage;
