'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import KpiCard from '@/components/ui/KpiCard';
import StatusTracker from '@/components/ui/StatusTracker';
import {
  Bike,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  LifeBuoy,
  Bell,
  Download,
  ExternalLink,
  ShieldCheck,
  Send,
  User,
  GraduationCap,
  Building,
  Upload,
  Printer,
  Check,
  Calendar,
  Zap,
  MapPin,
  FileCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, t, isLoading } = useAuth();

  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  // Ticket Form
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  // Payment Simulation
  const [payingInstallment, setPayingInstallment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Sync with URL hash if present
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.replace('#', '');
        if (hash && ['overview', 'application', 'documents', 'allocation', 'payments', 'tickets', 'notifications'].includes(hash)) {
          setActiveTab(hash);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchTab = (tabId: string) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      window.location.hash = tabId;
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, isLoading, router]);

  const loadData = async () => {
    setLoading(true);
    const [appRes, notifRes, ticketRes] = await Promise.all([
      apiRequest('/applications/my-app'),
      apiRequest('/notifications'),
      apiRequest('/tickets'),
    ]);

    if (appRes.success) setApplication(appRes.data);
    if (notifRes.success) setNotifications(notifRes.data || []);
    if (ticketRes.success) setTickets(ticketRes.data || []);
    setLoading(false);
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setSubmittingTicket(true);
    try {
      const res = await apiRequest('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: ticketSubject,
          message: ticketMessage,
          applicationId: application?.id,
        }),
      });
      if (res.success) {
        setTicketSuccess(true);
        setTicketSubject('');
        setTicketMessage('');
        loadData();
      }
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSimulatePayment = async (installmentNumber: number) => {
    setPayingInstallment(true);
    setTimeout(() => {
      setPayingInstallment(false);
      setPaymentSuccessMsg(`Payment of Rs. 4,500 for Installment Month ${installmentNumber} confirmed via 1Link! Receipt #TXN-2026-PB${Math.floor(100000 + Math.random() * 900000)}.`);
    }, 1000);
  };

  if (isLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#0E8C82] border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading Student Portal...</p>
        </div>
      </div>
    );
  }

  const campusUptakeData = [
    { name: 'PU Lahore', count: 1840 },
    { name: 'UET Lahore', count: 1220 },
    { name: 'GCU Lahore', count: 950 },
    { name: 'BZU Multan', count: 840 },
    { name: 'UAF FSD', count: 760 },
  ];

  const tabs = [
    { id: 'overview', label: t('overview'), icon: FileText },
    { id: 'application', label: t('myApplication'), icon: User },
    { id: 'documents', label: t('documents'), icon: FileCheck },
    { id: 'allocation', label: t('bikeAllocation'), icon: Bike },
    { id: 'payments', label: t('payments'), icon: CreditCard },
    { id: 'tickets', label: t('supportTickets'), icon: LifeBuoy },
    { id: 'notifications', label: t('notifications'), icon: Bell },
  ];

  return (
    <div className="flex-1 flex bg-[#EAF3F8]/50 sidebar-height">
      {/* Flagship Teal Sidebar matching Section 3 and Figure 1 */}
      <Sidebar activeTab={activeTab} onTabChange={switchTab} />

        {/* Main Student Workspace */}
        <div className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6 overflow-y-auto min-w-0">
          {/* Top Welcome Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Verified Student
                </span>
                <span className="text-xs text-slate-500 font-mono hidden xs:inline">
                  Roll# {application?.rollNumber || 'BSCS-2023-114'}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1 leading-tight">
                Welcome, {user?.fullName || 'Ali Raza'}
              </h1>
              <p className="text-xs text-slate-500">
                {application?.university?.name || 'University of the Punjab — Lahore'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!application ? (
                <Link
                  href="/student/apply"
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white btn-primary-gradient shadow-md flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Submit Application</span>
                </Link>
              ) : (
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Tracking Number
                  </div>
                  <div className="text-sm font-mono font-extrabold text-[#0E8C82]">
                    {application.applicationNo}
                  </div>
                </div>
              )}
            </div>
          </div>

        {/* Mobile / Quick Horizontal Tab Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => switchTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                  isCurrent
                    ? 'bg-[#0E8C82] text-white ring-2 ring-[#0E8C82]/30'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-200' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW (Flagship Dashboard Screen) */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 3 Alternating KPI Cards Matching Section 3 Specification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KpiCard
                variant="green"
                title={t('applicationStatus')}
                value={application ? application.status : 'Not Submitted'}
                subtitle={
                  application?.status === 'VERIFIED'
                    ? 'Academic & enrollment record attested'
                    : application?.status === 'SELECTED'
                    ? 'Selected in Provincial Balloting'
                    : application?.status === 'DELIVERED'
                    ? 'E-Bike delivered to student'
                    : 'Awaiting institutional review'
                }
                icon={FileText}
                badgeText={application ? `Ref: ${application.applicationNo}` : 'Action Required'}
                badgeType={application?.status === 'VERIFIED' || application?.status === 'SELECTED' ? 'success' : 'info'}
              />

              <KpiCard
                variant="blue"
                title={t('allocationStatus')}
                value={
                  application?.bikeAllocation
                    ? application.bikeAllocation.status === 'DELIVERED'
                      ? 'Delivered ✓'
                      : 'Allocated'
                    : application?.status === 'SELECTED'
                    ? 'Reserved'
                    : 'Not Allocated'
                }
                subtitle={
                  application?.bikeAllocation
                    ? application.bikeAllocation.centerName
                    : 'Assigned post-balloting draw'
                }
                icon={Bike}
                badgeText={
                  application?.bikeAllocation
                    ? application.bikeAllocation.bikeModel
                    : '72V Lithium-ion'
                }
                badgeType={application?.bikeAllocation ? 'success' : 'neutral'}
              />

              <KpiCard
                variant="green"
                title={t('installmentDue')}
                value="Rs. 4,500"
                subtitle="Due date: 1st of next month"
                icon={CreditCard}
                badgeText="50% Government Subsidized"
                badgeType="info"
              />
            </div>

            {/* Horizontal Milestone Status Tracker */}
            {application && (
              <StatusTracker
                currentStatus={application.status}
                rejectionReason={application.rejectionReason}
                rejectionRemarks={application.rejectionRemarks}
              />
            )}

            {/* Main Overview Grid: Chart & QR Voucher */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Chart: Scheme Uptake by Campus */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Scheme Uptake by Campus (Sample)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live verification numbers across Punjab Universities
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-[#0E8C82] border border-emerald-200">
                    HEC Verified HEIs
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campusUptakeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0E8C82',
                          borderRadius: '12px',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" fill="#1565C0" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right: Quick Action Voucher Card */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 rounded-xl bg-blue-50 text-[#1565C0]">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Handover Voucher & QR Token
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Present to dealer center during bike collection
                        </p>
                      </div>
                    </div>
                  </div>

                  {application?.bikeAllocation ? (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Center:</span>
                        <span className="font-bold text-slate-800 text-right">
                          {application.bikeAllocation.centerName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Model:</span>
                        <span className="font-bold text-slate-800">
                          {application.bikeAllocation.bikeModel}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">QR Token:</span>
                        <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                          {application.bikeAllocation.qrCodeToken}
                        </span>
                      </div>
                      <button
                        onClick={() => switchTab('allocation')}
                        className="w-full mt-2 py-2 rounded-lg bg-[#0E8C82] text-white font-bold text-xs hover:bg-[#0A6E66] transition flex items-center justify-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>View Full Pickup Voucher</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 text-center p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                      <Bike className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">Voucher Available Upon Selection</p>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                        Once the official selection engine executes balloting, your digital QR pickup voucher will be generated here automatically.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Warranty: 3-Year Battery Protection</span>
                  <span className="font-semibold text-[#0E8C82]">Punjab Green Fleet</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MY APPLICATION (Full Submitted Dossier View) */}
        {/* ========================================================= */}
        {activeTab === 'application' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0E8C82]">
                    Official Application Record
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Beneficiary Application Dossier
                  </h2>
                  <p className="text-xs text-slate-500">
                    Application Reference: <strong className="font-mono text-slate-800">{application?.applicationNo || 'N/A'}</strong>
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Application Summary</span>
                </button>
              </div>

              {/* Section 1: Personal & Identity */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#0E8C82]" />
                  <span>1. Personal & Identity Verification</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Full Name:</span>
                    <span className="font-bold text-slate-900 text-sm">{user?.fullName}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">CNIC / B-Form:</span>
                    <span className="font-bold font-mono text-slate-900 text-sm">{user?.cnic}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Date of Birth:</span>
                    <span className="font-bold text-slate-900">{application?.dob || '2003-05-14'} (18+ Verified)</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Father / Guardian:</span>
                    <span className="font-bold text-slate-900">{application?.fatherName || 'Muhammad Raza'}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Punjab Domicile:</span>
                    <span className="font-bold text-slate-900">{application?.domicileDistrict || 'Lahore'} (Punjab)</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Gender:</span>
                    <span className="font-bold text-slate-900">{application?.gender || 'MALE'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Motorcycle License */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Bike className="w-4 h-4 text-[#1565C0]" />
                  <span>2. Motorcycle Driving License (Excise Record)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">License / Permit No:</span>
                    <span className="font-bold font-mono text-slate-900">{application?.licenseNumber || 'LHR-LRN-2024-8921'}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">License Category:</span>
                    <span className="font-bold text-slate-900">{application?.licenseType === 'LEARNER' ? 'Motorcycle Learner Permit' : 'Permanent License'}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Expiry Date:</span>
                    <span className="font-bold text-slate-900">{application?.licenseExpiry || '2028-12-31'}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Academic Record */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#0E8C82]" />
                  <span>3. University Enrollment & Academic Standing</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">University:</span>
                    <span className="font-bold text-slate-900">{application?.university?.name || 'University of the Punjab'}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Program & Roll#:</span>
                    <span className="font-bold text-slate-900">{application?.degreeProgram || 'BS Computer Science'} ({application?.rollNumber || 'BSCS-2023-114'})</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block">Attendance Rate:</span>
                    <span className="font-bold text-emerald-700">{application?.attendanceRate || 88}% (Minimum 75% met)</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Declaration & Electronic Signature */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-950">Electronic Signature Verified:</span>
                    <p className="text-emerald-900 italic font-serif text-sm mt-0.5">
                      {application?.signatureName || user?.fullName}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-white rounded-full border border-emerald-300 font-bold text-[10px] text-emerald-800">
                    Legally Binding Consent ✓
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DOCUMENTS (Full Document Vault View) */}
        {/* ========================================================= */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0E8C82]">
                    Verified Repository
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Student Document Vault
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cryptographically stamped and certified documents for Punjab Government audit trail.
                  </p>
                </div>

                <button
                  onClick={() => alert('All mandatory statutory documents for this application cycle have already been uploaded and verified.')}
                  className="px-4 py-2 rounded-xl text-white font-bold text-xs btn-primary-gradient shadow-sm flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Extra Document</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'CNIC / B-Form (Front & Back)', type: 'CNIC_FRONT', size: '124 KB', date: '13 Sep 2026', verified: true },
                  { title: 'Punjab Domicile Certificate', type: 'DOMICILE', size: '340 KB', date: '13 Sep 2026', verified: true },
                  { title: 'Motorcycle License / Learner Permit', type: 'LICENSE', size: '156 KB', date: '13 Sep 2026', verified: true },
                  { title: 'University Student Identification Card', type: 'STUDENT_CARD', size: '210 KB', date: '13 Sep 2026', verified: true },
                  { title: 'Attendance & Academic Attestation', type: 'ATTESTATION', size: '180 KB', date: '13 Sep 2026', verified: true },
                ].map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                        <p className="text-[11px] text-slate-500">
                          {doc.size} • Verified {doc.date}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Verified ✓
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BIKE ALLOCATION (Handover Voucher & Dealer Screen) */}
        {/* ========================================================= */}
        {activeTab === 'allocation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0E8C82]">
                    Vehicle Allocation Voucher
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    E-Bike Handover & Collection Pass
                  </h2>
                  <p className="text-xs text-slate-500">
                    Present this digital voucher and QR token at your designated dealer collection center.
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Collection Voucher</span>
                </button>
              </div>

              {/* Main Voucher Display */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* QR Code Graphic Box */}
                <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center text-center shadow-md">
                  <div className="p-3 bg-white rounded-2xl shadow-inner mb-3">
                    <QrCode className="w-32 h-32 text-slate-900" />
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400">
                    Verification Voucher Token
                  </span>
                  <span className="font-mono font-bold text-sm text-emerald-400 mt-1 select-all">
                    {application?.bikeAllocation?.qrCodeToken || 'EBS-TOKEN-ALLOCATED'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Valid for physical scan by authorized dealer staff
                  </p>
                </div>

                {/* Bike Details & Center Info */}
                <div className="lg:col-span-8 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">Allocated E-Bike Model:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {application?.bikeAllocation?.bikeModel || 'Punjab Green E-Glide 1000 (Lithium-ion)'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">Pickup / Handover Center:</span>
                      <span className="font-bold text-slate-900">
                        {application?.bikeAllocation?.centerName || 'Metro E-Bikes Authorized Center (Lahore Hub)'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">Frame / Chassis Number:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {application?.bikeAllocation?.frameNumber || 'PB-EBS-2026-CHASSIS-8921'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block">Battery Serial (3-Year Warranty):</span>
                      <span className="font-mono font-bold text-slate-800">
                        {application?.bikeAllocation?.batterySerialNumber || 'LITH-72V-WARR-2026-0045'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 text-xs">
                    <p className="font-bold">Mandatory Items to Bring to Collection Center:</p>
                    <p>1. Original CNIC and original motorcycle learner permit/driving license.</p>
                    <p>2. Active university student card and printed/mobile copy of this QR voucher.</p>
                    <p>3. Personal helmet for test ride and physical safety inspection.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PAYMENTS (Repayment Schedule & Subsidy Ledger) */}
        {/* ========================================================= */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1565C0]">
                    Financial Subsidies & Installments
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    24-Month Repayment Schedule
                  </h2>
                  <p className="text-xs text-slate-500">
                    50% Government of the Punjab Subsidy • Zero Mark-Up / Interest-Free
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Monthly Installment</span>
                    <span className="text-lg font-bold text-[#0E8C82]">Rs. 4,500 / month</span>
                  </div>
                </div>
              </div>

              {paymentSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                  <span>{paymentSuccessMsg}</span>
                  <button onClick={() => setPaymentSuccessMsg(null)} className="underline">
                    Dismiss
                  </button>
                </div>
              )}

              {/* Installment Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="p-3">Installment #</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Govt Subsidy (50%)</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Payment Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {[
                      { num: 1, due: '01 Oct 2026', amount: 'Rs. 4,500', status: 'DUE_SOON' },
                      { num: 2, due: '01 Nov 2026', amount: 'Rs. 4,500', status: 'UPCOMING' },
                      { num: 3, due: '01 Dec 2026', amount: 'Rs. 4,500', status: 'UPCOMING' },
                      { num: 4, due: '01 Jan 2027', amount: 'Rs. 4,500', status: 'UPCOMING' },
                      { num: 5, due: '01 Feb 2027', amount: 'Rs. 4,500', status: 'UPCOMING' },
                      { num: 6, due: '01 Mar 2027', amount: 'Rs. 4,500', status: 'UPCOMING' },
                    ].map((inst) => (
                      <tr key={inst.num} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">Installment Month {inst.num}</td>
                        <td className="p-3 text-slate-600">{inst.due}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{inst.amount}</td>
                        <td className="p-3 text-emerald-700 font-semibold">Rs. 4,500 (Covered by Govt)</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              inst.status === 'DUE_SOON'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {inst.status === 'DUE_SOON' ? 'Due Soon' : 'Upcoming'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleSimulatePayment(inst.num)}
                            disabled={payingInstallment}
                            className="px-3 py-1.5 rounded-lg bg-[#1565C0] hover:bg-[#0d47a1] text-white font-bold text-[11px] transition shadow-sm"
                          >
                            Pay Online (1Link / Wallet)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: SUPPORT TICKETS (Helpdesk Inquiry Center) */}
        {/* ========================================================= */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="pb-6 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0E8C82]">
                  Dedicated Assistance
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Support Helpdesk & Dispute Center
                </h2>
                <p className="text-xs text-slate-500">
                  Track inquiries and communicate directly with Transport Dept & University Coordinators.
                </p>
              </div>

              {ticketSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                  <span>Your support ticket has been submitted. Response SLA is within 24 hours.</span>
                  <button onClick={() => setTicketSuccess(false)} className="font-bold underline">
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Inquiry Category / Subject
                      </label>
                      <input
                        type="text"
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="e.g. Inquire about university verification delay"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Application Reference
                      </label>
                      <input
                        type="text"
                        disabled
                        value={application?.applicationNo || 'Not Submitted'}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-100 font-mono text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Detailed Message
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Explain your issue clearly with any relevant roll number or document details..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingTicket}
                      className="px-6 py-2.5 rounded-xl text-white font-bold text-xs btn-primary-gradient shadow-md flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingTicket ? 'Submitting...' : 'Submit Support Ticket'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Past Tickets List */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Your Past Support Inquiries
                </h3>
                {tickets.length === 0 ? (
                  <p className="text-xs text-slate-400">No previous support tickets filed.</p>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((t) => (
                      <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{t.subject}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {t.status}
                          </span>
                        </div>
                        <p className="text-slate-600">{t.message}</p>
                        {t.response && (
                          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 mt-2">
                            <span className="font-bold">Official Response:</span>
                            <p className="mt-0.5">{t.response}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: NOTIFICATIONS (Full Alerts Feed) */}
        {/* ========================================================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="pb-6 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0E8C82]">
                  Activity Log
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Notifications & Scheme Updates
                </h2>
                <p className="text-xs text-slate-500">
                  Automated milestone alerts and communications from the Government of Punjab.
                </p>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center p-8 text-slate-400 text-xs">
                  No notifications to display.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3.5 text-xs"
                    >
                      <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 flex-shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900">{notif.title}</h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
