import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { REQUEST_STATUS } from '../constants';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const RequestCard = ({ request, isExpert, onAction }) => {
  const other = isExpert ? request.seeker : request.expert;
  const [responding, setResponding] = useState(false);

  const handleAction = async (action) => {
    setResponding(true);
    try {
      await onAction(request._id, action);
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start gap-4">
        <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=c844ed&color=fff&size=48`} alt={other?.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-semibold text-gray-900">{other?.name}</p>
              <p className="text-sm text-purple-600">{request.topic}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[request.status] || 'bg-gray-100 text-gray-500'}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{request.message}</p>
          <p className="text-xs text-gray-400 mt-2">{new Date(request.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {isExpert && request.status === REQUEST_STATUS.PENDING && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
          <button onClick={() => handleAction('accept')} disabled={responding} className="flex-1 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
            Accept
          </button>
          <button onClick={() => handleAction('decline')} disabled={responding} className="flex-1 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors">
            Decline
          </button>
        </div>
      )}

      {!isExpert && request.status === REQUEST_STATUS.PENDING && (
        <div className="mt-4 pt-4 border-t border-gray-50">
          <button onClick={() => handleAction('cancel')} disabled={responding} className="w-full py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-60 transition-colors">
            Cancel Request
          </button>
        </div>
      )}

      {request.status === REQUEST_STATUS.ACCEPTED && (
        <div className="mt-4 pt-4 border-t border-gray-50">
          <Link to={`/messages/${other?._id}`} className="block w-full py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors text-center">
            Open Chat
          </Link>
        </div>
      )}
    </div>
  );
};

const MyRequestsPage = () => {
  const { user } = useAuth();
  const isExpert = user?.role === 'expert';
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchRequests = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await api.get('/mentorship', { params });
      setRequests(res.data.data.requests);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filter]); // eslint-disable-line

  const handleAction = async (requestId, action) => {
    try {
      if (action === 'cancel') {
        await api.put(`/mentorship/${requestId}/cancel`);
        toast.success('Request cancelled');
      } else {
        await api.put(`/mentorship/${requestId}/respond`, { action });
        toast.success(`Request ${action}ed`);
      }
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const tabs = ['', 'pending', 'accepted', 'completed', 'declined'];
  const tabLabels = { '': 'All', pending: 'Pending', accepted: 'Active', completed: 'Completed', declined: 'Declined' };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{isExpert ? 'Mentorship Requests' : 'My Requests'}</h1>
          {!isExpert && (
            <Link to="/explore" className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors">
              Find Mentors
            </Link>
          )}
        </div>

        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`flex-1 min-w-max px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === t ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl p-5 animate-pulse"><div className="flex gap-4"><div className="w-12 h-12 bg-gray-200 rounded-full" /><div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-1/3" /><div className="h-3 bg-gray-200 rounded w-1/4" /></div></div></div>)}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">No {filter || ''} requests yet</p>
            {!isExpert && <Link to="/explore" className="inline-block mt-4 px-5 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700">Find a Mentor</Link>}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => <RequestCard key={req._id} request={req} isExpert={isExpert} onAction={handleAction} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequestsPage;
