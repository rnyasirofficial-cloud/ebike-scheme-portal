'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api';
import KpiCard from '@/components/ui/KpiCard';
import {
  Shield,
  Settings,
  RefreshCw,
  Award,
  Upload,
  Download,
  AlertTriangle,
  Building2,
  FileText,
  Users,
  CheckCircle,
  Play,
  Check,
  TrendingDown,
  Database,
  Server,
  HardDrive,
  Cpu,
  Activity,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

export default function AdminCommandCenterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'kpis' | 'selection' | 'universities' | 'config' | 'database'>('kpis');
  const [analytics, setAnalytics] = useState<any>(null);
  const [config, setConfig] = useState<any>({
    selectionMode: 'LOTTERY',
    subsidyPercentage: 50,
    maxQuota: 10000,
    monthlyInstallment: 4500,
    installmentMonths: 24,
  });
  const [draws, setDraws] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingHec, setSyncingHec] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [runningDraw, setRunningDraw] = useState(false);
  const [drawResult, setDrawResult] = useState<any>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableRecords, setTableRecords] = useState<any[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/login');
      return;
    }

    if (user) {
      loadAllData();
    }
  }, [user, isLoading, router]);

  const loadAllData = async () => {
    setLoading(true);
    const [analyticsRes, configRes, drawsRes, unisRes, dbRes] = await Promise.all([
      apiRequest('/selection/analytics'),
      apiRequest('/selection/config'),
      apiRequest('/selection/draws'),
      apiRequest('/universities'),
      apiRequest('/database/status'),
    ]);

    if (analyticsRes.success) setAnalytics(analyticsRes);
    if (configRes.success && configRes.data) setConfig(configRes.data);
    if (drawsRes.success) setDraws(drawsRes.data || []);
    if (unisRes.success) setUniversities(unisRes.data || []);
    if (dbRes.success && dbRes.data) setDatabaseInfo(dbRes.data);
    setLoading(false);
  };

  const inspectTable = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoadingTable(true);
    try {
      const res = await apiRequest(`/database/tables/${tableName}`);
      if (res.success && res.data) {
        setTableRecords(res.data);
      } else {
        setTableRecords([]);
      }
    } finally {
      setLoadingTable(false);
    }
  };

  const downloadDbBackup = () => {
    window.open('http://localhost:5000/api/database/export', '_blank');
  };

  const handleSyncHec = async () => {
    setSyncingHec(true);
    setSyncResult(null);
    try {
      const res = await apiRequest('/universities/sync', { method: 'POST' });
      if (res.success) {
        setSyncResult(res.message || 'HEC directory synchronized successfully.');
        loadAllData();
      } else {
        setSyncResult(res.message || 'HEC Sync failed. Preserved last-known-good directory.');
      }
    } finally {
      setSyncingHec(false);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    const formData = new FormData();
    formData.append('file', csvFile);

    setSyncingHec(true);
    try {
      const res = await apiRequest('/universities/upload-csv', {
        method: 'POST',
        body: formData,
      });
      if (res.success) {
        setSyncResult(res.message || 'CSV imported successfully.');
        loadAllData();
      } else {
        setSyncResult(res.message || 'CSV upload failed');
      }
    } finally {
      setSyncingHec(false);
    }
  };

  const handleExecuteDraw = async () => {
    if (!confirm(`Execute official ${config.selectionMode} selection draw now?`)) return;

    setRunningDraw(true);
    setDrawResult(null);
    try {
      const res = await apiRequest('/selection/run', {
        method: 'POST',
        body: JSON.stringify({
          mode: config.selectionMode,
          quota: 25,
        }),
      });

      if (res.success) {
        setDrawResult(res.data);
        loadAllData();
      } else {
        alert(res.message || 'Selection execution failed');
      }
    } finally {
      setRunningDraw(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/selection/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
    if (res.success) {
      alert('Scheme configuration updated successfully!');
    }
  };

  const exportResultsCsv = (results: any[], drawId: string) => {
    const headers = ['Rank,Application_No,Student_Name,CNIC,University\n'];
    const rows = results.map(
      (r) => `${r.selectionRank},${r.applicationNo},"${r.maskedName}","${r.maskedCnic}","${r.universityName}"`
    );
    const blob = new Blob([headers.join(''), rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EBS_Lottery_Draw_${drawId}.csv`;
    a.click();
  };

  const funnelColors = ['#1FA37B', '#0E8C82', '#1565C0', '#4338CA', '#059669'];

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-chrome rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Government of the Punjab • Program Administration Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            E-Bike Scheme Command Center
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            Administrator: {user?.fullName} • Live Funnel Analytics, Selection Draw Engine & HEC Synchronization
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 bg-white/15 p-1.5 rounded-2xl backdrop-blur-md">
          {[
            { id: 'kpis', label: 'Live KPIs & Funnel' },
            { id: 'selection', label: 'Selection Engine' },
            { id: 'universities', label: 'HEC Directory' },
            { id: 'config', label: 'Scheme Config' },
            { id: 'database', label: 'Databases & Registries' },
          ].map((t) => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === t.id
                  ? 'bg-white text-[#0E8C82] shadow-sm'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: Live KPIs & Funnel */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              variant="green"
              title="Applications Received"
              value={analytics?.kpis?.totalApplications ?? '...'}
              subtitle="All Punjab Districts"
              icon={FileText}
              badgeText="Phase-I Active"
              badgeType="info"
            />
            <KpiCard
              variant="blue"
              title="Institution Verified"
              value={analytics?.kpis?.verifiedCount ?? '...'}
              subtitle="HEC Universities Attested"
              icon={Building2}
              badgeText="Ready for Draw"
              badgeType="success"
            />
            <KpiCard
              variant="green"
              title="Selected Beneficiaries"
              value={analytics?.kpis?.selectedCount ?? '...'}
              subtitle="Draw Winners Allocated"
              icon={Award}
              badgeText="Subsidized"
              badgeType="success"
            />
            <KpiCard
              variant="blue"
              title="Active HEC Universities"
              value={analytics?.kpis?.universitiesCount ?? '52'}
              subtitle="Punjab Public & Private"
              icon={Users}
              badgeText="HEC Registry Synced"
              badgeType="info"
            />
          </div>

          {/* Funnel Chart & Fraud Flags */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Recharts Funnel Breakdown */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Applicant Drop-Off Funnel Analysis
                  </h3>
                  <p className="text-xs text-slate-500">
                    Funnel conversion from submission to final delivery
                  </p>
                </div>
                <TrendingDown className="w-5 h-5 text-slate-400" />
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics?.funnel || []}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 60, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis
                      dataKey="stage"
                      type="category"
                      tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                      width={130}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0A6E66',
                        borderRadius: '12px',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {(analytics?.funnel || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={funnelColors[index % funnelColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fraud & Anomaly Flags */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Fraud & Anomaly Watchlist
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    Live Watch
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {(analytics?.fraudFlags || []).map((flag: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{flag.type}</span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            flag.severity === 'HIGH'
                              ? 'bg-red-100 text-red-800'
                              : flag.severity === 'MEDIUM'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {flag.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{flag.detail}</p>
                      <div className="text-[10px] text-slate-400">{flag.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                Automated cross-check with NADRA Verisys and Excise Databases.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Selection Engine Trigger & Anonymized Results */}
      {activeTab === 'selection' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0E8C82]">
                  Provincial Balloting Engine
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Execute Selection Draw
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Current Selection Mode: <strong className="text-[#1565C0]">{config.selectionMode}</strong> (Configurable in Scheme Config)
                </p>
              </div>

              <button
                id="run-draw-btn"
                onClick={handleExecuteDraw}
                disabled={runningDraw}
                className="px-6 py-3 rounded-xl font-bold text-xs text-white btn-primary-gradient shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{runningDraw ? 'Running Cryptographic Draw...' : 'Trigger Selection Draw'}</span>
              </button>
            </div>

            {/* Draw Summary Alert */}
            {drawResult && (
              <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-sm">Draw Executed Successfully: {drawResult.drawId}</h4>
                  </div>
                  <button
                    onClick={() => exportResultsCsv(drawResult.resultsLog, drawResult.drawId)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Official CSV</span>
                  </button>
                </div>
                <p className="text-xs text-emerald-800">
                  Total Candidates: {drawResult.totalEligible} • Selected Winners: {drawResult.totalSelected} • Mode: {drawResult.mode}
                </p>
              </div>
            )}

            {/* Historical Draws */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Public Anonymized Draw Records
              </h3>

              <div className="space-y-4">
                {draws.length === 0 ? (
                  <p className="text-xs text-slate-400">No draws executed yet.</p>
                ) : (
                  draws.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{d.id}</div>
                        <div className="text-slate-500">
                          Executed: {new Date(d.createdAt).toLocaleString()} by {d.executedBy}
                        </div>
                        <div className="text-emerald-700 font-semibold mt-1">
                          Mode: {d.mode} • Selected: {d.totalSelected} applicants
                        </div>
                      </div>

                      <button
                        onClick={() => exportResultsCsv(d.anonymizedResults, d.id)}
                        className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Anonymized Results</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HEC University Directory & Scraper/CSV Sync Tool */}
      {activeTab === 'universities' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0E8C82]">
                  HEC Official Registry Integration
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  Punjab Recognized Institutions Sync Tool
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronize from HEC endpoint (hec.gov.pk) or upload backup CSV with fallback to last-known-good.
                </p>
              </div>

              <button
                id="hec-sync-btn"
                onClick={handleSyncHec}
                disabled={syncingHec}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white btn-primary-gradient shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncingHec ? 'animate-spin' : ''}`} />
                <span>{syncingHec ? 'Synchronizing...' : 'Sync from HEC Registry'}</span>
              </button>
            </div>

            {syncResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium">
                {syncResult}
              </div>
            )}

            {/* CSV Upload Fallback */}
            <form onSubmit={handleCsvUpload} className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-4 text-xs">
              <div className="flex-1 w-full">
                <span className="font-bold text-slate-700 block mb-1">Manual CSV Upload Fallback:</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-[#0E8C82] hover:file:bg-emerald-100"
                />
              </div>
              <button
                type="submit"
                disabled={!csvFile || syncingHec}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs disabled:opacity-50"
              >
                Upload CSV
              </button>
            </form>

            {/* University Table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-3">Institution Name</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Sector</th>
                    <th className="p-3">HEC Ref No.</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {universities.slice(0, 15).map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{u.name}</td>
                      <td className="p-3">{u.city}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                          {u.sector}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{u.hecReferenceNo || 'HEC-PB-CONF'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Recognized ✓
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 text-center text-slate-400 text-xs border-t border-slate-100">
                Showing top 15 of {universities.length} synchronized institutions in Punjab
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Scheme Configuration */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 max-w-2xl">
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">
            Provincial Scheme Parameters
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Changes apply to subsequent selection draws and installment generations.
          </p>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Candidate Selection Mechanism
              </label>
              <select
                value={config.selectionMode}
                onChange={(e) => setConfig({ ...config, selectionMode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-[#0E8C82]"
              >
                <option value="LOTTERY">Randomized E-Balloting (Fair Lottery)</option>
                <option value="MERIT_SCORE">Merit Scoring (CGPA 40% + Attendance 30% + Low-Income 20%)</option>
                <option value="FCFS">First-Come First-Served (Timestamp based)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Government Subsidy (%)
                </label>
                <input
                  type="number"
                  value={config.subsidyPercentage}
                  onChange={(e) => setConfig({ ...config, subsidyPercentage: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phase-I Total Quota
                </label>
                <input
                  type="number"
                  value={config.maxQuota}
                  onChange={(e) => setConfig({ ...config, maxQuota: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Monthly Installment (PKR)
                </label>
                <input
                  type="number"
                  value={config.monthlyInstallment}
                  onChange={(e) => setConfig({ ...config, monthlyInstallment: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Installment Duration (Months)
                </label>
                <input
                  type="number"
                  value={config.installmentMonths}
                  onChange={(e) => setConfig({ ...config, installmentMonths: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-white font-bold text-xs btn-primary-gradient shadow-md"
              >
                Save Configuration Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: Databases & Verification Registries Engine */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Status & Engine Overview Banner */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#0E8C82] text-xs font-bold mb-2">
                  <Database className="w-3.5 h-3.5" />
                  <span>Database Engine: {databaseInfo?.engine || 'SQLite 3 (Prisma ORM)'}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Relational Database Status & Storage Metrics
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Connected Source: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{databaseInfo?.databaseUrl || 'file:./prisma/dev.db'}</code> • Storage Size: <strong className="text-slate-800">{databaseInfo?.size || '172 KB'}</strong> • Status: <span className="text-emerald-600 font-bold">HEALTHY</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={downloadDbBackup}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Backup (.JSON)</span>
                </button>
                <button
                  onClick={loadAllData}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
                  title="Refresh Database Stats"
                >
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* 8 Tables Grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[
                { table: 'universities', name: 'Universities', count: databaseInfo?.tables?.universities ?? 52, icon: Building2, desc: 'Punjab HEC Registry' },
                { table: 'users', name: 'Users & Roles', count: databaseInfo?.tables?.users ?? 7, icon: Users, desc: 'Students, Staff, Admin' },
                { table: 'applications', name: 'Applications', count: databaseInfo?.tables?.applications ?? 4, icon: FileText, desc: 'Statutory Student Apps' },
                { table: 'dealers', name: 'Dealer Centers', count: databaseInfo?.tables?.dealershipCenters ?? 5, icon: Server, desc: 'Authorized Handover Hubs' },
                { table: 'bikemodels', name: 'Bike Models', count: databaseInfo?.tables?.bikeModels ?? 3, icon: Cpu, desc: 'Approved EV Specifications' },
                { table: 'payments', name: 'Installment Ledger', count: databaseInfo?.tables?.payments ?? 12, icon: Activity, desc: '24-Mo Payment Records' },
                { table: 'bikeallocations', name: 'Bike Allocations', count: databaseInfo?.tables?.bikeAllocations ?? 2, icon: Award, desc: 'Chassis & QR Tokens' },
                { table: 'auditlogs', name: 'Audit Trail', count: databaseInfo?.tables?.auditLogs ?? 9, icon: Shield, desc: 'PITB / Transparency Log' },
              ].map((t) => (
                <button
                  key={t.table}
                  onClick={() => inspectTable(t.table)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedTable === t.table
                      ? 'border-[#0E8C82] bg-emerald-50/50 shadow-md ring-2 ring-[#0E8C82]/20'
                      : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <t.icon className="w-4 h-4 text-[#0E8C82]" />
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200">
                      {t.count} rows
                    </span>
                  </div>
                  <h4 className="mt-2 text-xs font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* External Verification Registries Panel */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
            <h3 className="font-serif text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0E8C82]" />
              <span>Connected Statutory Verification Registries</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: 'NADRA Verisys Citizen Database',
                  rule: 'Rule 1 & Rule 2: Age (18+) & CNIC Verisys',
                  status: 'CONNECTED',
                  latency: '38ms',
                  details: 'Real-time Pakistani citizen identity validation, birth date check, and family tree verification.',
                },
                {
                  name: 'Punjab Excise & Taxation Motor Registry',
                  rule: 'Rule 4: Motorcycle Driving License & Learner Permit',
                  status: 'CONNECTED',
                  latency: '44ms',
                  details: 'Direct integration with DLMIS (Driving License Management Information System) across Punjab.',
                },
                {
                  name: 'HEC Pakistan Higher Education Registry',
                  rule: 'Rule 5 & Rule 6: Degree-Awarding Institution & Attendance',
                  status: 'SYNCHRONIZED',
                  latency: '25ms',
                  details: 'Official directory of 52 accredited public/private universities within Punjab with attestation webhooks.',
                },
                {
                  name: 'Punjab PITB E-Balloting Algorithm Engine',
                  rule: 'Transparent Selection & Winner Allocation',
                  status: 'READY',
                  latency: '12ms',
                  details: 'SHA-256 cryptographic pseudo-random balloting engine ensuring verifiable zero-bias draws.',
                },
              ].map((reg, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{reg.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {reg.status} ({reg.latency})
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#0E8C82]">{reg.rule}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{reg.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Table Records Explorer (When a table is clicked) */}
          {selectedTable && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 capitalize">
                    Live Table Records: {selectedTable}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing latest entries directly queried from {databaseInfo?.engine || 'relational database'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTable(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Close Table
                </button>
              </div>

              {loadingTable ? (
                <div className="py-8 text-center text-xs text-slate-500">Querying table records...</div>
              ) : tableRecords.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No records found in this table.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        {Object.keys(tableRecords[0]).slice(0, 6).map((col) => (
                          <th key={col} className="py-2.5 px-3">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tableRecords.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/80 transition">
                          {Object.entries(row).slice(0, 6).map(([k, val], cIdx) => (
                            <td key={cIdx} className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
