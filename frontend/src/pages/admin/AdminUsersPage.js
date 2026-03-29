import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = ['', 'seeker', 'expert', 'admin'];
const STATUS_OPTIONS = ['', 'active', 'banned', 'deactivated'];

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [actionUserId, setActionUserId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (role) params.role = role;
      if (status) params.status = status;
      const res = await api.get('/admin/users', { params });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, role, status, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateStatus = async (userId, newStatus) => {
    setActionUserId(userId);
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`User ${newStatus}`);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, status: newStatus } : u));
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setActionUserId(null);
    }
  };

  const statusBadge = (s) => {
    const map = { active: 'bg-green-100 text-green-700', banned: 'bg-red-100 text-red-700', deactivated: 'bg-gray-100 text-gray-600' };
    return `text-xs px-2 py-0.5 rounded-full capitalize ${map[s] || 'bg-gray-100 text-gray-600'}`;
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage platform members</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">All Roles</option>
          {ROLE_OPTIONS.slice(1).map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.slice(1).map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-9 h-9 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-32" />
                  <div className="h-2 bg-gray-200 rounded w-48" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-14" />
                <div className="h-5 bg-gray-200 rounded w-14" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=c844ed&color=fff&size=36`}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs capitalize px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">{u.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={statusBadge(u.status || 'active')}>{u.status || 'active'}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {(u.status === 'banned') ? (
                        <button
                          onClick={() => updateStatus(u._id, 'active')}
                          disabled={actionUserId === u._id}
                          className="text-xs px-3 py-1.5 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
                        >
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(u._id, 'banned')}
                          disabled={actionUserId === u._id || u.role === 'admin'}
                          className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          Ban
                        </button>
                      )}
                      {(u.status !== 'deactivated') && (
                        <button
                          onClick={() => updateStatus(u._id, 'deactivated')}
                          disabled={actionUserId === u._id || u.role === 'admin'}
                          className="text-xs px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
