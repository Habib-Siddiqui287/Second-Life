import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/savedItemService';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Building2, Search, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

export default function AdminOrganizations() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrgs = () => {
    setLoading(true);
    adminService.getOrganizations({ search: search || undefined })
      .then((data) => setOrgs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrgs();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Organization Directory</h1>
          <p className="text-xs text-slate-500">
            Overview of all registered non-profits, charities, and community institutions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/verification"
            className="px-4 py-2 bg-[#15803D] hover:bg-[#0F5D28] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verification Queue</span>
          </Link>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-600 shadow-xs"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading organizations directory..." />
      ) : orgs.length === 0 ? (
        <EmptyState
          title="No organizations found"
          message="No organizations matching your search."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-6">Organization</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">License / Tax ID</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {orgs.map((org) => (
                  <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#15803D] font-extrabold text-xs flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block">{org.organization_name}</span>
                          <span className="text-[11px] text-slate-400">{org.contact_person} • {org.official_email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {org.organization_type}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600 font-bold">
                      {org.license_number || 'Pending'}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={org.verification_status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to="/admin/verification"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-[#15803D] rounded-xl font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                      >
                        <span>Audit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
