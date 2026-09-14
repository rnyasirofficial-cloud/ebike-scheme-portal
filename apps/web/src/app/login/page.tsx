'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api';
import { mockLogin } from '@/lib/mock-auth';
import { Bike, Shield, GraduationCap, Building, Wrench, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });

      if (res.success && res.token && res.user) {
        login(res.token, res.user);
        // Redirect based on role
        if (res.user.role === 'STUDENT') router.push('/student');
        else if (res.user.role === 'COORDINATOR') router.push('/coordinator');
        else if (res.user.role === 'ADMIN') router.push('/admin');
        else if (res.user.role === 'DEALER') router.push('/dealer');
        else router.push('/');
        return;
      }

      // API is reachable but returned an error (e.g. wrong password)
      if (res.message && !res.message.toLowerCase().includes('fetch') && !res.message.toLowerCase().includes('connect')) {
        setError(res.message || 'Invalid credentials');
        return;
      }
    } catch {
      // Network error — API unreachable, fall through to mock
    }

    // ── Fallback: Mock / Demo authentication ──────────────────────────────
    const mock = mockLogin(identifier, password);
    if (mock) {
      login(mock.token, mock.user);
      if (mock.user.role === 'STUDENT') router.push('/student');
      else if (mock.user.role === 'COORDINATOR') router.push('/coordinator');
      else if (mock.user.role === 'ADMIN') router.push('/admin');
      else if (mock.user.role === 'DEALER') router.push('/dealer');
      else router.push('/');
    } else {
      setError('Invalid credentials. Please try a demo account or check your details.');
    }

    setLoading(false);
  };

  const fillDemoAccount = (ident: string, pass: string) => {
    setIdentifier(ident);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-chrome flex items-center justify-center text-white shadow-md">
            <Bike className="w-8 h-8" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to E-Bike Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Government of Punjab Green Transport Initiative
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              CNIC or Official Email
            </label>
            <input
              id="login-identifier"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g., 35201-1234567-1 or student@punjab.gov.pk"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <span className="text-xs text-[#0E8C82] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-slate-50/50"
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white btn-primary-gradient shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo One-Click Fill Pills */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
            Quick Demo Accounts (1-Click Fill)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              id="demo-student-btn"
              onClick={() => fillDemoAccount('student@punjab.gov.pk', 'DemoPass123!')}
              className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 font-semibold text-left transition flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">Student (Ali)</span>
            </button>

            <button
              type="button"
              id="demo-coordinator-btn"
              onClick={() => fillDemoAccount('coordinator@pu.edu.pk', 'DemoPass123!')}
              className="p-2 rounded-lg border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-teal-900 font-semibold text-left transition flex items-center gap-1.5"
            >
              <Building className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <span className="truncate">Coordinator (PU)</span>
            </button>

            <button
              type="button"
              id="demo-admin-btn"
              onClick={() => fillDemoAccount('admin@transport.punjab.gov.pk', 'AdminPass123!')}
              className="p-2 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 font-semibold text-left transition flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Admin (Director)</span>
            </button>

            <button
              type="button"
              id="demo-dealer-btn"
              onClick={() => fillDemoAccount('dealer@honda-ebikes.pk', 'DealerPass123!')}
              className="p-2 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 font-semibold text-left transition flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              <span className="truncate">Dealer (Metro)</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          New applicant student?{' '}
          <Link href="/register" className="font-bold text-[#0E8C82] hover:underline">
            Register now with CNIC
          </Link>
        </div>
      </div>
    </div>
  );
}
