import React, { useEffect, useRef, useState } from 'react';
import { Navigation, MessageSquare, MapPin, Square, Radio } from 'lucide-react';
import { connectionService } from '../services/connectionService';
import { useAuth } from '../context/AuthContext';
import LiveLocationMap from './LiveLocationMap';

export default function ConnectionTrackingFeedback({ connection, onRefresh, showToast }) {
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  useEffect(() => () => {
    if (watchIdRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  if (!connection) return null;

  const isParticipant = (user?.role === 'DONOR' && String(user?.id) === String(connection.donor?.id)) ||
    (user?.role === 'RECEIVER' && String(user?.id) === String(connection.receiver?.id));
  const donorLat = connection.donor_live_latitude;
  const donorLng = connection.donor_live_longitude;
  const receiverLat = connection.receiver_live_latitude;
  const receiverLng = connection.receiver_live_longitude;

  const sendPosition = async (coords, forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && now - lastSentRef.current < 8000) return;
    lastSentRef.current = now;
    try {
      await connectionService.shareLocation(connection.id, {
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: `Live location (${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)})`,
      });
      if (forceRefresh) {
        showToast('Your live location is now shared with the other participant.', 'success');
        onRefresh?.();
      }
    } catch (err) {
      if (forceRefresh) showToast(err.response?.data?.error || 'Could not share your location.', 'error');
    }
  };

  const startSharing = () => {
    if (!navigator.geolocation) { showToast('Live location is not supported by this browser.', 'error'); return; }
    setSharing(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => sendPosition(coords, !lastSentRef.current),
      () => { setSharing(false); showToast('Please allow location access to share your pickup location.', 'error'); },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    setSharing(false);
    showToast('Live location sharing stopped. Your last shared position remains visible.', 'info');
  };

  const submitFeedback = async () => {
    if (!comment.trim()) return;
    setSending(true);
    try {
      await connectionService.addFeedback(connection.id, { rating: 5, comment: comment.trim() });
      setComment('');
      showToast('Feedback submitted successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not submit feedback.', 'error');
    } finally { setSending(false); }
  };

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><Radio className="w-4 h-4 text-emerald-600" /><p className="text-sm font-extrabold text-slate-900">Live pickup tracking</p></div>
            <p className="text-[11px] text-slate-500 mt-1">The donor's current position is shown below. The receiver page refreshes automatically.</p>
          </div>
          {isParticipant && (sharing ? (
            <button type="button" onClick={stopSharing} className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2"><Square className="w-3.5 h-3.5" /> Stop Live Location</button>
          ) : (
            <button type="button" onClick={startSharing} className="px-4 py-2 bg-[#15803D] text-white rounded-xl text-xs font-bold flex items-center gap-2"><Navigation className="w-4 h-4" /> Share Live Location</button>
          ))}
        </div>

        <LiveLocationMap latitude={donorLat} longitude={donorLng} title="Donor's current pickup location" />

        {donorLat !== null && donorLat !== undefined && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-[11px] text-emerald-900"><MapPin className="w-3.5 h-3.5 inline mr-1" /> Donor location is shared. This map updates as the donor's live position changes.</div>
        )}
      </div>

      {receiverLat !== null && receiverLat !== undefined && <LiveLocationMap latitude={receiverLat} longitude={receiverLng} title="Receiver's shared location" />}

      {connection.status === 'COMPLETED' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-emerald-700" /><h3 className="text-sm font-extrabold text-slate-900">Donation Feedback</h3></div>
          <p className="text-[11px] text-slate-500 mt-1">Leave a short comment about the completed handover.</p>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full mt-3 px-3 py-2.5 rounded-xl border border-slate-200 text-xs" placeholder="Write your feedback..." />
          <button type="button" onClick={submitFeedback} disabled={sending || !comment.trim()} className="mt-3 px-4 py-2 bg-[#15803D] text-white rounded-xl text-xs font-bold disabled:opacity-50">{sending ? 'Submitting...' : 'Submit Feedback'}</button>
        </div>
      )}
    </div>
  );
}
