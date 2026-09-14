'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api';
import { mockRegister, mockVerifyOtp } from '@/lib/mock-auth';
import { Bike, ShieldCheck, ArrowRight, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    cnic: '',
    mobile: '',
    email: '',
    password: '',
  });

  const [otpStage, setOtpStage] = useState(false);
  const [otp, setOtp] = useState('');
  const [devMockOtp, setDevMockOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCnic = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 13);
    if (cleaned.length <= 5) return cleaned;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setOtpStage(true);
        if (res.data?.devMockOtp) {
          setDevMockOtp(res.data.devMockOtp);
          setOtp(res.data.devMockOtp);
        }
        setLoading(false);
        return;
      }
    } catch {
      // API unreachable — fall through to mock
    }

    // ── Fallback: Mock registration ───────────────────────────────────────
    const mock = mockRegister(formData);
    setOtpStage(true);
    setDevMockOtp(mock.data.devMockOtp);
    setOtp(mock.data.devMockOtp);
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ mobile: formData.mobile, otp }),
      });

      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        router.push('/student/apply');
        return;
      }
    } catch {
      // API unreachable — fall through to mock
    }

    // ── Fallback: Mock OTP verification ──────────────────────────────────
    const mock = mockVerifyOtp(formData.mobile, otp);
    if (mock) {
      login(mock.token, mock.user);
      router.push('/student/apply');
    } else {
      setError('Invalid OTP. Use 123456 in demo mode.');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-chrome flex items-center justify-center text-white shadow-md">
            <Bike className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            Student Registration
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {otpStage
              ? 'Enter the 6-digit OTP sent to your mobile phone'
              : 'Sign up with your CNIC to begin your e-bike application'}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!otpStage ? (
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name (As per CNIC)
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g., Muhammad Hamza"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                CNIC / B-Form Number
              </label>
              <input
                id="reg-cnic"
                type="text"
                required
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: formatCnic(e.target.value) })}
                placeholder="35201-1234567-1"
                maxLength={15}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number (03XXXXXXXXX)
              </label>
              <input
                id="reg-mobile"
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="03001234567"
                maxLength={11}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="hamza@student.edu.pk"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                minLength={8}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
              />
            </div>

            <button
              id="reg-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white btn-primary-gradient shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            {devMockOtp && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <span className="font-bold">Dev Mock SMS Gateway:</span> Your OTP code is{' '}
                <span className="font-mono font-bold text-sm text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300">
                  {devMockOtp}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                6-Digit OTP Code
              </label>
              <div className="relative">
                <Smartphone className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                <input
                  id="reg-otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-base font-mono tracking-widest text-center focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
                />
              </div>
            </div>

            <button
              id="verify-otp-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white btn-primary-gradient shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify Mobile & Proceed</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link href="/login" className="font-bold text-[#0E8C82] hover:underline">
            Sign In to your account
          </Link>
        </div>
      </div>
    </div>
  );
}
