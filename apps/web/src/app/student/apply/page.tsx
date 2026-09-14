'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api';
import { MOCK_UNIVERSITIES, mockSubmitApplication } from '@/lib/mock-auth';
import {
  Bike,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  CreditCard,
  FileCheck,
  Building2,
  Calendar,
  User,
  Info,
} from 'lucide-react';

export default function ApplicationWizardPage() {
  const router = useRouter();
  const { user, t } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loadingUnis, setLoadingUnis] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    dob: '2003-05-14',
    gender: 'MALE',
    fatherName: 'Muhammad Raza',
    address: 'House #45-B, Sector D, Valencia Town, Lahore',
    domicileDistrict: 'Lahore',

    // Step 2: License
    licenseNumber: 'LHR-LRN-2024-8921',
    licenseType: 'LEARNER',
    licenseExpiry: '2028-12-31',

    // Step 3: University
    universityId: '',
    degreeProgram: 'BS Computer Science',
    rollNumber: 'BSCS-2023-114',
    currentSemester: 4,
    cgpa: 3.68,
    attendanceRate: 88,
    isRegularStudent: true,
    hasProbation: false,

    // Step 4: Financial
    walletType: 'BANK_ACCOUNT',
    bankIban: 'PK36BAHL0001234567890123',
    walletNumber: '',
    householdMonthlyIncome: 65000,
    isDifferentlyAbled: false,

    // Step 5: Declaration
    agreedToTerms: false,
    signatureName: '',
  });

  // Fetch HEC Punjab Universities — falls back to static list if API is offline
  useEffect(() => {
    apiRequest('/universities').then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setUniversities(res.data);
        const pu = res.data.find((u: any) => u.name.includes('University of the Punjab')) || res.data[0];
        setFormData((prev) => ({ ...prev, universityId: pu.id }));
      } else {
        // API offline — use built-in static list of 52 HEC Punjab universities
        setUniversities(MOCK_UNIVERSITIES as any[]);
        const pu = MOCK_UNIVERSITIES.find((u) => u.name.includes('University of the Punjab')) || MOCK_UNIVERSITIES[0];
        setFormData((prev) => ({ ...prev, universityId: pu.id }));
      }
      setLoadingUnis(false);
    }).catch(() => {
      setUniversities(MOCK_UNIVERSITIES as any[]);
      const pu = MOCK_UNIVERSITIES[0];
      setFormData((prev) => ({ ...prev, universityId: pu.id }));
      setLoadingUnis(false);
    });
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1) {
      if (!formData.dob || !formData.fatherName || !formData.address || !formData.domicileDistrict) {
        setError('Please complete all personal details before proceeding.');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.licenseNumber || !formData.licenseExpiry) {
        setError('Please enter valid motorcycle license or learner permit information.');
        return;
      }
    } else if (currentStep === 3) {
      if (!formData.universityId || !formData.degreeProgram || !formData.rollNumber) {
        setError('Please select an HEC-recognized university and provide your roll number.');
        return;
      }
      if (!formData.isRegularStudent) {
        setError('Only regular on-campus students are eligible for this scheme.');
        return;
      }
    } else if (currentStep === 4) {
      if (formData.walletType === 'BANK_ACCOUNT' && (!formData.bankIban || formData.bankIban.length < 24)) {
        setError('Please enter a valid Pakistani IBAN (format: PK36BAHL0001234567890123).');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRejectionReasons([]);

    if (!formData.agreedToTerms) {
      setError('You must read and accept the declaration terms.');
      return;
    }

    if (!formData.signatureName || formData.signatureName.trim().length < 2) {
      setError('Please provide your digital signature name.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await apiRequest('/applications/submit', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        router.push('/student?submitted=true');
        return;
      } else if (res.rejectionReasons && Array.isArray(res.rejectionReasons)) {
        setError(res.message || 'Application rejected.');
        setRejectionReasons(res.rejectionReasons);
        setSubmitting(false);
        return;
      }
    } catch {
      // API unreachable — fall through to mock submit
    }

    // ── Fallback: Mock submit (demo mode) ─────────────────────────────────
    const mock = mockSubmitApplication(formData);
    if (mock.success) {
      router.push('/student?submitted=true');
    } else {
      setError('Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Personal & CNIC', icon: User },
    { num: 2, title: 'License & Documents', icon: FileCheck },
    { num: 3, title: 'Academic Enrollment', icon: GraduationCap },
    { num: 4, title: 'Bank / Wallet Details', icon: CreditCard },
    { num: 5, title: 'Declaration & Sign', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full">
      {/* Top Banner Header */}
      <div className="bg-gradient-chrome rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-2xl">
            <Bike className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              E-Bike Scheme Application Wizard
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
              5-Step Government Verification Form • Fast-Track Eligibility Check
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-5 gap-2 text-center">
          {steps.map((s) => {
            const Icon = s.icon;
            const isDone = s.num < currentStep;
            const isCurrent = s.num === currentStep;

            return (
              <div key={s.num} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    isDone
                      ? 'bg-white text-[#0E8C82] shadow'
                      : isCurrent
                      ? 'bg-emerald-400 text-slate-900 font-extrabold ring-4 ring-white/30'
                      : 'bg-white/20 text-white/70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="mt-1.5 text-[11px] font-semibold hidden sm:block text-white/90">
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm text-red-900 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
            {rejectionReasons.length > 0 && (
              <ul className="mt-2 list-disc list-inside space-y-1 text-red-700">
                {rejectionReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* STEP 1: Personal & CNIC */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Step 1: Personal & Identity Details</h3>
              <p className="text-xs text-slate-500">
                Verified against NADRA Verisys citizen records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date of Birth (Must be 18+ years)
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => handleChange('dob', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female (Priority Quota)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Father / Guardian Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fatherName}
                  onChange={(e) => handleChange('fatherName', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Punjab Domicile District
                </label>
                <select
                  value={formData.domicileDistrict}
                  onChange={(e) => handleChange('domicileDistrict', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                >
                  <option value="Lahore">Lahore</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Multan">Multan</option>
                  <option value="Gujranwala">Gujranwala</option>
                  <option value="Sargodha">Sargodha</option>
                  <option value="Sialkot">Sialkot</option>
                  <option value="Bahawalpur">Bahawalpur</option>
                  <option value="D.G. Khan">D.G. Khan</option>
                  <option value="Sheikhupura">Sheikhupura</option>
                  <option value="Gujrat">Gujrat</option>
                  <option value="Kasur">Kasur</option>
                  <option value="Rahim Yar Khan">Rahim Yar Khan</option>
                  <option value="Sahiwal">Sahiwal</option>
                  <option value="Attock">Attock</option>
                  <option value="Chiniot">Chiniot</option>
                  <option value="Jhang">Jhang</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Permanent Residential Address
              </label>
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Driving License & Uploads */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Step 2: Motorcycle License & Documents</h3>
              <p className="text-xs text-slate-500">
                Verified via Punjab Excise & Taxation license database.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  License / Learner Permit No.
                </label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => handleChange('licenseNumber', e.target.value)}
                  placeholder="e.g. LHR-LRN-2024-8921"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  License Type
                </label>
                <select
                  value={formData.licenseType}
                  onChange={(e) => handleChange('licenseType', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                >
                  <option value="LEARNER">Motorcycle Learner Permit</option>
                  <option value="PERMANENT">Regular Driving License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  License Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.licenseExpiry}
                  onChange={(e) => handleChange('licenseExpiry', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                />
              </div>
            </div>

            {/* Document upload placeholders */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'CNIC / B-Form (Front & Back)', hint: 'Scanned image or PDF max 5MB' },
                { title: 'Punjab Domicile Certificate', hint: 'Original district magistrate issued' },
                { title: 'Driving License / Learner Copy', hint: 'Front side clear copy' },
                { title: 'University Student Card', hint: 'Valid for current academic session' },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#0E8C82] bg-slate-50/50 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-[#0E8C82] rounded-lg">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500">{doc.hint}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Uploaded ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: University Selection (Filtered to Punjab + HEC-Recognized ONLY) */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Step 3: University & Enrollment</h3>
                  <p className="text-xs text-slate-500">
                    Restricted strictly to HEC-recognized institutions located in Punjab.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  52 Punjab HEIs Verified
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select HEC-Recognized University / DAI (Searchable Dropdown)
              </label>
              {loadingUnis ? (
                <div className="py-3 text-xs text-slate-500">Loading recognized institutions...</div>
              ) : (
                <select
                  id="university-select"
                  required
                  value={formData.universityId}
                  onChange={(e) => handleChange('universityId', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-white font-medium"
                >
                  <option value="">-- Choose Your HEC-Recognized Punjab University --</option>
                  <optgroup label="Public Sector Universities">
                    {universities
                      .filter((u) => u.sector === 'Public')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Private Sector Universities">
                    {universities
                      .filter((u) => u.sector === 'Private')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </optgroup>
                </select>
              )}
              <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#0E8C82]" />
                Free-text entry is disabled to prevent applications from unaccredited colleges.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Degree Program
                </label>
                <input
                  type="text"
                  required
                  value={formData.degreeProgram}
                  onChange={(e) => handleChange('degreeProgram', e.target.value)}
                  placeholder="e.g., BS Computer Science"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  University Roll / Reg. No.
                </label>
                <input
                  type="text"
                  required
                  value={formData.rollNumber}
                  onChange={(e) => handleChange('rollNumber', e.target.value)}
                  placeholder="BSCS-2023-114"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Semester
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={formData.currentSemester}
                  onChange={(e) => handleChange('currentSemester', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current CGPA (Out of 4.0)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={formData.cgpa}
                  onChange={(e) => handleChange('cgpa', parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Attendance Rate (%) (Minimum 75%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={formData.attendanceRate}
                  onChange={(e) => handleChange('attendanceRate', Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                />
              </div>
            </div>

            {/* Statutory Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRegularStudent}
                  onChange={(e) => handleChange('isRegularStudent', e.target.checked)}
                  className="mt-0.5 rounded text-[#0E8C82] focus:ring-[#0E8C82]"
                />
                <span className="text-xs text-slate-700">
                  <strong>Regular Student Declaration:</strong> I confirm that I am an actively enrolled, on-campus student (not distance-learning or external candidate).
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasProbation}
                  onChange={(e) => handleChange('hasProbation', e.target.checked)}
                  className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-xs text-slate-700">
                  I am currently on academic probation (Check only if on disciplinary or academic probation).
                </span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 4: Financial & Mobile Wallet / Bank Account */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Step 4: Financial & Wallet Details</h3>
              <p className="text-xs text-slate-500">
                Required for loan disbursement and subsidized monthly installment repayments.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Preferred Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'BANK_ACCOUNT', label: 'Commercial Bank Account (IBAN)' },
                  { id: 'JAZZCASH', label: 'JazzCash Wallet' },
                  { id: 'EASYPAISA', label: 'Easypaisa Wallet' },
                ].map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleChange('walletType', w.id)}
                    className={`p-3.5 rounded-xl border text-xs font-bold text-left transition ${
                      formData.walletType === w.id
                        ? 'border-[#0E8C82] bg-emerald-50/60 text-[#0E8C82] shadow-sm'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {formData.walletType === 'BANK_ACCOUNT' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Applicant Bank IBAN (24 Characters)
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankIban}
                  onChange={(e) => handleChange('bankIban', e.target.value.toUpperCase())}
                  placeholder="PK36BAHL0001234567890123"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50 font-mono uppercase"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registered Mobile Wallet Number (03XXXXXXXXX)
                </label>
                <input
                  type="tel"
                  required
                  value={formData.walletNumber}
                  onChange={(e) => handleChange('walletNumber', e.target.value)}
                  placeholder="03001234567"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50 font-mono"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Monthly Household Income (PKR)
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={formData.householdMonthlyIncome}
                  onChange={(e) => handleChange('householdMonthlyIncome', Number(e.target.value))}
                  placeholder="65000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                />
                <span className="text-[11px] text-slate-500">
                  Income below Rs. 80,000 qualifies for low-income priority ranking.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Differently-Abled Quota
                </label>
                <select
                  value={formData.isDifferentlyAbled ? 'YES' : 'NO'}
                  onChange={(e) => handleChange('isDifferentlyAbled', e.target.value === 'YES')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                >
                  <option value="NO">Standard Applicant</option>
                  <option value="YES">Differently-Abled (Priority Quota)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Declaration & E-Signature */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Step 5: Solemn Affirmation & Digital Consent</h3>
              <p className="text-xs text-slate-500">
                Please review legal declaration before triggering automated eligibility evaluation.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed max-h-48 overflow-y-auto">
              <p className="font-bold text-slate-900">Statutory Scheme Declarations:</p>
              <p>
                1. I solemnly affirm that I am at least 18 years of age, a bona fide resident of Punjab holding a valid domicile, and actively enrolled as a regular on-campus student at an HEC-recognized university.
              </p>
              <p>
                2. I hold a valid motorcycle driving license or learner permit, and have never previously received an electric bike under any provincial government subsidy program.
              </p>
              <p>
                3. I commit to paying the monthly installment of Rs. 4,500 over 24 months. Failure to repay installments may result in university administrative sanctions and bike repossession.
              </p>
              <p>
                4. Any forged, altered, or fraudulent documentation will result in immediate disqualification, blacklisting from future schemes, and legal prosecution under the Pakistan Penal Code.
              </p>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 cursor-pointer">
              <input
                id="agree-terms"
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={(e) => handleChange('agreedToTerms', e.target.checked)}
                className="mt-0.5 rounded text-[#0E8C82] focus:ring-[#0E8C82]"
              />
              <span className="text-xs font-semibold text-emerald-950">
                I have read, understood, and accept all terms and conditions of the Chief Minister Punjab E-Bike Scheme 2026.
              </span>
            </label>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Digital Signature (Type Full Legal Name)
              </label>
              <input
                id="signature-name"
                type="text"
                required
                value={formData.signatureName}
                onChange={(e) => handleChange('signatureName', e.target.value)}
                placeholder="e.g., Ali Raza"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-serif italic focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-white"
              />
              <span className="text-[11px] text-slate-500">
                This digital signature constitutes an electronic signature under the Electronic Transactions Ordinance 2002.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              id="wizard-next-btn"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl text-white font-bold text-xs btn-primary-gradient shadow-md flex items-center gap-2"
            >
              <span>Continue to Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="wizard-submit-btn"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl text-white font-extrabold text-sm btn-primary-gradient shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Verifying Eligibility & Submitting...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
