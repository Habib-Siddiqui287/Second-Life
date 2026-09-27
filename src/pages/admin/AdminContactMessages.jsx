import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/savedItemService';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { Search, Mail, MessageSquare, CheckCircle, Clock, Trash2, Eye, Reply } from 'lucide-react';

export default function AdminContactMessages() {
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchMessages = () => {
    setLoading(true);
    adminService.getContactMessages()
      .then((data) => setMessages(data))
      .catch(() => showToast('Failed to load contact messages.', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const openDetailModal = (msg) => {
    setSelectedMessage(msg);
    setAdminNotes(msg.admin_notes || '');
  };

  const toggleResolved = async (msg) => {
    const newStatus = !msg.is_resolved;
    try {
      await adminService.updateContactMessage(msg.id, { is_resolved: newStatus });
      showToast(`Inquiry marked as ${newStatus ? 'resolved' : 'pending'}.`, 'success');
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_resolved: newStatus } : m))
      );
      if (selectedMessage && selectedMessage.id === msg.id) {
        setSelectedMessage((prev) => ({ ...prev, is_resolved: newStatus }));
      }
    } catch {
      showToast('Failed to update inquiry status.', 'error');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;
    setSavingNote(true);
    try {
      await adminService.updateContactMessage(selectedMessage.id, { admin_notes: adminNotes });
      showToast('Admin note saved.', 'success');
      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMessage.id ? { ...m, admin_notes: adminNotes } : m))
      );
      setSelectedMessage((prev) => ({ ...prev, admin_notes: adminNotes }));
    } catch {
      showToast('Failed to save notes.', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await adminService.deleteContactMessage(id);
      showToast('Inquiry deleted successfully.', 'success');
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage(null);
      }
    } catch {
      showToast('Failed to delete inquiry.', 'error');
    }
  };

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      (m.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.message || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'PENDING') return !m.is_resolved;
    if (filter === 'RESOLVED') return m.is_resolved;
    return true;
  });

  const totalCount = messages.length;
  const pendingCount = messages.filter((m) => !m.is_resolved).length;
  const resolvedCount = messages.filter((m) => m.is_resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">User Inquiries & Messages</h1>
          <p className="text-xs text-slate-500">
            Review and respond to messages submitted via the public contact and support forms.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search messages by name, email, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Received</p>
            <p className="text-2xl font-extrabold text-slate-900">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Needs Attention</p>
            <p className="text-2xl font-extrabold text-amber-600">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-soft flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-extrabold text-blue-600">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {['ALL', 'PENDING', 'RESOLVED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-colors ${
              filter === tab
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'ALL' && `All (${totalCount})`}
            {tab === 'PENDING' && `Pending (${pendingCount})`}
            {tab === 'RESOLVED' && `Resolved (${resolvedCount})`}
          </button>
        ))}
      </div>

      {/* Content Table */}
      {loading ? (
        <LoadingSpinner text="Loading inquiries..." />
      ) : filteredMessages.length === 0 ? (
        <EmptyState
          title="No inquiries found"
          message="No contact submissions match the current filter or search criteria."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Sender</th>
                  <th className="py-3.5 px-6">Subject & Preview</th>
                  <th className="py-3.5 px-6">Received</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {filteredMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                          {(msg.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{msg.name}</p>
                          <p className="text-[11px] text-slate-400">{msg.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-xs md:max-w-md">
                      <p className="font-bold text-slate-900 truncate">{msg.subject}</p>
                      <p className="text-[11px] text-slate-500 truncate">{msg.message}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          msg.is_resolved
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {msg.is_resolved ? 'Resolved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(msg)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="View Message"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleResolved(msg)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                            msg.is_resolved
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {msg.is_resolved ? 'Reopen' : 'Resolve'}
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <Modal
          isOpen={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
          title="Inquiry Details"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="font-extrabold text-sm text-slate-900">{selectedMessage.name}</p>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {selectedMessage.email}
                </a>
              </div>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  selectedMessage.is_resolved
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {selectedMessage.is_resolved ? 'Resolved' : 'Pending'}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Subject</p>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">{selectedMessage.subject}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Message Content</p>
              <div className="mt-1 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Internal Admin Notes
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log internal resolution steps or responder details..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  disabled={savingNote}
                  onClick={handleSaveNotes}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-colors"
              >
                <Reply className="w-3.5 h-3.5" />
                Reply via Email
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleResolved(selectedMessage)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
                    selectedMessage.is_resolved
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  {selectedMessage.is_resolved ? 'Mark as Pending' : 'Mark as Resolved'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
