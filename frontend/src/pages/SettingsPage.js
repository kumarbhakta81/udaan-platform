import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, formState: { errors: pwdErrors } } = useForm();
  const { register: regNotif, handleSubmit: handleNotif } = useForm({
    defaultValues: {
      mentorshipRequests: user?.notifications?.mentorshipRequests ?? true,
      forumActivity: user?.notifications?.forumActivity ?? true,
      resourceUpdates: user?.notifications?.resourceUpdates ?? false,
    },
  });

  const onChangePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed! Please log in again.');
      resetPwd();
      setTimeout(() => logout(), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const onSaveNotifications = async (data) => {
    setSavingNotifs(true);
    try {
      await api.put('/users/me/account', { notifications: data });
      updateUser({ ...user, notifications: data });
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSavingNotifs(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await api.delete('/users/me');
      toast.success('Account deleted');
      logout();
    } catch {
      toast.error('Failed to delete account');
      setDeletingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Account info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">Account</h2>
          <div className="flex items-center gap-4">
            <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=c844ed&color=fff&size=60`} alt={user?.name} className="w-14 h-14 rounded-full object-cover" />
            <div>
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="text-xs capitalize px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">Change Password</h2>
          <form onSubmit={handlePwd(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" {...regPwd('currentPassword', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              {pwdErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" {...regPwd('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              {pwdErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwdErrors.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" {...regPwd('confirmPassword', { required: 'Required' })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <button type="submit" disabled={savingPassword} className="px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-60 transition-colors">
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-4">Notifications</h2>
          <form onSubmit={handleNotif(onSaveNotifications)} className="space-y-3">
            {[
              { key: 'mentorshipRequests', label: 'Mentorship request updates', desc: 'When requests are accepted, declined, or completed' },
              { key: 'forumActivity', label: 'Forum activity', desc: 'Replies and upvotes on your posts' },
              { key: 'resourceUpdates', label: 'New resources', desc: 'When new resources are added to the library' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <input type="checkbox" {...regNotif(key)} className="mt-1 rounded accent-purple-600 w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </label>
            ))}
            <button type="submit" disabled={savingNotifs} className="px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-60 transition-colors">
              {savingNotifs ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h2 className="font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-gray-500 mb-4">Deleting your account is permanent and cannot be undone.</p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="px-5 py-2.5 border border-red-300 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors">
              Delete Account
            </button>
          ) : (
            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-sm font-medium text-red-700 mb-3">Are you absolutely sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={handleDeleteAccount} disabled={deletingAccount} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors">
                  {deletingAccount ? 'Deleting...' : 'Yes, Delete My Account'}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
