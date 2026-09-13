'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api';
import KpiCard from '@/components/ui/KpiCard';
import {
  Bike,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Search,
  Building,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function DealerPortalPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState('');
  const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
  const [handoverData, setHandoverData] = useState({
    registrationNumber: 'LEG-2026-9081',
    frameNumber: 'MEB-72V-998231',
    batterySerialNumber: 'LITH-PB-72V-5512',
    remarks: 'Battery tested, charger & official registration document handed over to student.',
  });
  const [submittingHandover, setSubmittingHandover] = useState(false);
  const [handoverSuccess, setHandoverSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'DEALER' && user.role !== 'ADMIN'))) {
      router.push('/login');
      return;
    }

    if (user) {
      loadDealerData();
    }
  }, [user, isLoading, router]);

  const loadDealerData = async () => {
    setLoading(true);
    const res = await apiRequest('/dealer/dashboard');
    if (res.success) {
      setDashboardData(res);
    }
    setLoading(false);
  };

  const handleLookupQr = (tokenToLook: string) => {
    setErrorMessage(null);
    setHandoverSuccess(false);

    const match = (dashboardData?.allocations || []).find(
      (a: any) => a.qrCodeToken.toUpperCase() === tokenToLook.trim().toUpperCase()
    );

    if (match) {
      setSelectedAllocation(match);
      setQrToken(match.qrCodeToken);
    } else {
      setErrorMessage(`No pending bike allocation matching QR voucher: "${tokenToLook}".`);
    }
  };

  const handleConfirmHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllocation) return;

    setSubmittingHandover(true);
    setErrorMessage(null);

    try {
      const res = await apiRequest('/dealer/confirm-handover', {
        method: 'POST',
        body: JSON.stringify({
          qrCodeToken: selectedAllocation.qrCodeToken,
          ...handoverData,
        }),
      });

      if (res.success) {
        setHandoverSuccess(true);
        setSelectedAllocation(null);
        setQrToken('');
        loadDealerData();
      } else {
        setErrorMessage(res.message || 'Handover failed');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Handover failed');
    } finally {
      setSubmittingHandover(false);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-chrome rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Wrench className="w-4 h-4" />
            <span>Authorized OEM / Dealer Handover Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            {dashboardData?.inventoryStats?.centerName || 'Metro E-Bikes Authorized Center (Lahore Hub)'}
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            Staff: {user?.fullName} • QR-Code Delivery Verification, Battery & Frame Registration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-sm text-center">
            <div className="text-xl font-extrabold">{dashboardData?.inventoryStats?.availableStock ?? 148}</div>
            <div className="text-[11px] text-emerald-100">Stock on Floor</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-sm text-center">
            <div className="text-xl font-extrabold text-emerald-300">
              {dashboardData?.inventoryStats?.deliveredCount ?? 0}
            </div>
            <div className="text-[11px] text-emerald-100">Delivered</div>
          </div>
        </div>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          variant="green"
          title="Center E-Bike Quota"
          value={`${dashboardData?.inventoryStats?.stockTotal ?? 150} Units`}
          subtitle="Lithium 72V E-Glide Series"
          icon={Bike}
          badgeText="Inventory Synced"
          badgeType="success"
        />
        <KpiCard
          variant="blue"
          title="Allocated Queue"
          value={`${dashboardData?.inventoryStats?.allocatedCount ?? 0} Students`}
          subtitle="Awaiting In-Person Handover"
          icon={QrCode}
          badgeText="Campus Proximity"
          badgeType="info"
        />
        <KpiCard
          variant="green"
          title="Handover Confirmation SLA"
          value="100% On-Time"
          subtitle="Real-time PITB notification"
          icon={ShieldCheck}
          badgeText="Digital Verification"
          badgeType="success"
        />
      </div>

      {/* Main Grid: QR Scan Tool & Allocation Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* QR Scanner / Input Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <QrCode className="w-5 h-5 text-[#0E8C82]" />
            <h3 className="text-base font-bold text-slate-900">
              Scan / Enter QR Handover Token
            </h3>
          </div>

          {handoverSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>E-Bike handover confirmed and registration certificate generated!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Student QR Voucher Token
            </label>
            <div className="flex gap-2">
              <input
                id="qr-token-input"
                type="text"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                placeholder="e.g. EBS-TOKEN-..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold focus:ring-2 focus:ring-[#0E8C82]"
              />
              <button
                id="lookup-token-btn"
                type="button"
                onClick={() => handleLookupQr(qrToken)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Scan / Check
              </button>
            </div>
          </div>

          {/* Handover Details Form */}
          {selectedAllocation && (
            <form onSubmit={handleConfirmHandover} className="mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400">Student Applicant:</span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedAllocation.application.student.fullName}
                </p>
                <p className="text-slate-500 font-mono">
                  CNIC: {selectedAllocation.application.student.cnic}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assigned Bike Registration Number
                </label>
                <input
                  type="text"
                  required
                  value={handoverData.registrationNumber}
                  onChange={(e) => setHandoverData({ ...handoverData, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Chassis / Frame Serial Number
                </label>
                <input
                  type="text"
                  required
                  value={handoverData.frameNumber}
                  onChange={(e) => setHandoverData({ ...handoverData, frameNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  72V Lithium Battery Serial (Warranty)
                </label>
                <input
                  type="text"
                  required
                  value={handoverData.batterySerialNumber}
                  onChange={(e) => setHandoverData({ ...handoverData, batterySerialNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <button
                id="confirm-handover-btn"
                type="submit"
                disabled={submittingHandover}
                className="w-full py-3 rounded-xl text-white font-bold text-xs btn-primary-gradient shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Physical Delivery</span>
              </button>
            </form>
          )}
        </div>

        {/* Allocation Queue Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Center Allocation Queue
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3">Student / CNIC</th>
                  <th className="p-3">University</th>
                  <th className="p-3">QR Token</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(dashboardData?.allocations || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No e-bikes currently allocated to this center. Trigger selection draw from Admin panel to allocate bikes.
                    </td>
                  </tr>
                ) : (
                  (dashboardData?.allocations || []).map((alloc: any) => (
                    <tr key={alloc.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{alloc.application.student.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{alloc.application.student.cnic}</div>
                      </td>
                      <td className="p-3 text-slate-600">{alloc.application.university.city} Campus</td>
                      <td className="p-3 font-mono font-bold text-[#0E8C82]">{alloc.qrCodeToken}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            alloc.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {alloc.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {alloc.status !== 'DELIVERED' && (
                          <button
                            onClick={() => handleLookupQr(alloc.qrCodeToken)}
                            className="px-2.5 py-1 rounded bg-[#0E8C82] text-white font-bold text-[11px] hover:bg-[#0A6E66]"
                          >
                            Deliver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
