'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api';
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  FileCheck,
  GraduationCap,
  Calendar,
  Clock,
  User,
  Eye,
  ShieldCheck,
} from 'lucide-react';

export default function CoordinatorPortalPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('ACADEMIC_PROBATION_FAILED');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'COORDINATOR' && user.role !== 'ADMIN'))) {
      router.push('/login');
      return;
    }

    if (user) {
      loadQueue();
    }
  }, [user, isLoading, router]);

  const loadQueue = async () => {
    setLoading(true);
    const res = await apiRequest('/applications/queue');
    if (res.success && res.data) {
      setApplications(res.data);
    }
    setLoading(false);
  };

  const handleApprove = async (appId: string) => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await apiRequest(`/applications/${appId}/verify`, { method: 'POST' });
      if (res.success) {
        setActionMessage('Application verified and attested successfully!');
        setSelectedApp(null);
        loadQueue();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionRemarks || rejectionRemarks.trim().length < 5) {
      alert('Please enter mandatory rejection remarks (at least 5 characters).');
      return;
    }

    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await apiRequest(`/applications/${selectedApp.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({
          rejectionReason,
          remarks: rejectionRemarks,
        }),
      });

      if (res.success) {
        setActionMessage('Application disqualified with mandatory remarks recorded.');
        setRejectionModalOpen(false);
        setRejectionRemarks('');
        setSelectedApp(null);
        loadQueue();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.applicationNo.toLowerCase().includes(search.toLowerCase()) ||
      app.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      app.student.cnic.includes(search);

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isPendingSlaExceeded = (createdAt: string) => {
    const daysOld = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysOld > 5;
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-chrome rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Institutional Verification Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            {user?.university?.name || 'University of the Punjab (Lahore Campus)'}
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            Coordinator: {user?.fullName} • Dedicated Desk for Student Attendance & Academic Standing Attestation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-sm text-center">
            <div className="text-xl font-extrabold">{applications.length}</div>
            <div className="text-[11px] text-emerald-100">Total Applicants</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-sm text-center">
            <div className="text-xl font-extrabold text-amber-300">
              {applications.filter((a) => a.status === 'SUBMITTED').length}
            </div>
            <div className="text-[11px] text-emerald-100">Pending Review</div>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll#, or CNIC..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-[#0E8C82]"
          >
            <option value="ALL">All Application Statuses</option>
            <option value="SUBMITTED">Pending Verification</option>
            <option value="VERIFIED">Verified / Approved</option>
            <option value="REJECTED">Disqualified</option>
            <option value="SELECTED">Selected in Draw</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">App Ref / Student</th>
                <th className="p-4">Program & Roll#</th>
                <th className="p-4">Attendance / CGPA</th>
                <th className="p-4">SLA Status</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    No applications matching current filters.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const slaExceeded = app.status === 'SUBMITTED' && isPendingSlaExceeded(app.createdAt);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{app.student.fullName}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{app.applicationNo}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{app.student.cnic}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{app.degreeProgram}</div>
                        <div className="text-slate-500 font-mono">Roll: {app.rollNumber}</div>
                        <div className="text-slate-400">Sem {app.currentSemester}</div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-bold ${
                              app.attendanceRate >= 75 ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {app.attendanceRate}% Att.
                          </span>
                        </div>
                        <div className="text-slate-500">CGPA: {app.cgpa || 'N/A'}</div>
                      </td>

                      <td className="p-4">
                        {slaExceeded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            SLA Warning (&gt;5 Days)
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Within SLA
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            app.status === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : app.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : app.status === 'SELECTED'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                            title="View Student Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {app.status === 'SUBMITTED' && (
                            <>
                              <button
                                id={`approve-btn-${app.id}`}
                                onClick={() => handleApprove(app.id)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verify</span>
                              </button>

                              <button
                                id={`reject-btn-${app.id}`}
                                onClick={() => {
                                  setSelectedApp(app);
                                  setRejectionModalOpen(true);
                                }}
                                disabled={actionLoading}
                                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review / Details Modal */}
      {selectedApp && !rejectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Applicant Verification Dossier
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedApp.applicationNo} • {selectedApp.student.fullName}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400">CNIC:</span>
                <p className="font-mono font-bold text-slate-800">{selectedApp.student.cnic}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400">Mobile:</span>
                <p className="font-mono font-bold text-slate-800">{selectedApp.student.mobile}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400">Program & Roll:</span>
                <p className="font-bold text-slate-800">{selectedApp.degreeProgram} ({selectedApp.rollNumber})</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400">Attendance & Probation:</span>
                <p className="font-bold text-slate-800">
                  {selectedApp.attendanceRate}% Attendance • {selectedApp.hasProbation ? 'On Probation' : 'Clear Standing'}
                </p>
              </div>
            </div>

            {/* Document Check List */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Attached Statutory Documents
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['CNIC Front & Back', 'Punjab Domicile', 'Excise Driving License', 'Student Identification'].map((d, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <span>{d}</span>
                    <span className="text-emerald-700 font-bold">Verified ✓</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Close
              </button>
              {selectedApp.status === 'SUBMITTED' && (
                <>
                  <button
                    onClick={() => {
                      setRejectionModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                  >
                    Disqualify Application
                  </button>
                  <button
                    onClick={() => handleApprove(selectedApp.id)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                  >
                    Attest & Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Rejection Remarks Modal */}
      {rejectionModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-2xl">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Reject Application
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedApp.student.fullName} ({selectedApp.applicationNo})
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason Category
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500"
                >
                  <option value="ACADEMIC_PROBATION_FAILED">Active Academic Probation / Attendance &lt; 75%</option>
                  <option value="NON_REGULAR_STUDENT">Student is Not Enrolled in Regular On-Campus Program</option>
                  <option value="COORDINATOR_DISQUALIFIED">Forged Document or Disciplinary Record</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mandatory Rejection Remarks (Required for Audit Trail)
                </label>
                <textarea
                  id="rejection-remarks-input"
                  rows={3}
                  required
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  placeholder="Explain exact grounds for disqualification (e.g., student is on 2nd probation semester)..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                id="confirm-reject-btn"
                onClick={handleReject}
                disabled={actionLoading}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
