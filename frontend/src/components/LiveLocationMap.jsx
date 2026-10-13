import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';

export default function LiveLocationMap({ latitude, longitude, title = 'Current live location' }) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
        <p className="text-xs font-semibold text-slate-500">Live location has not been shared yet.</p>
      </div>
    );
  }

  const lat = Number(latitude);
  const lng = Number(longitude);
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const embedUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-extrabold text-slate-900">{title}</span>
        </div>
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#15803D] hover:underline">
          Open Google Maps <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
        <iframe title={title} src={embedUrl} className="w-full h-72 border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>
      <p className="text-[10px] text-slate-400">Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)} • Updates automatically while live sharing is enabled.</p>
    </div>
  );
}
