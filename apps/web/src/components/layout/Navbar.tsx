'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Bike, LogOut, Menu, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout, t } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="bg-gradient-chrome border-b border-white/15 shadow-lg sticky top-0 z-50 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          {/* Brand Identity / Government Crest */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 text-white group min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:bg-white/25 transition-all border border-white/20 flex-shrink-0">
              <Bike className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-200 group-hover:scale-105 transition-transform" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-sm sm:text-lg lg:text-xl tracking-tight text-white drop-shadow-sm leading-tight line-clamp-2 sm:line-clamp-1">
                  <span className="hidden xs:inline">{t('portalTitle')}</span>
                  <span className="xs:hidden">Punjab E-Bike Portal</span>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-white/20 text-emerald-100 rounded-full border border-white/20 backdrop-blur-sm flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                  <span>2026</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-emerald-100/80 font-normal tracking-wide hidden sm:block mt-0.5">
                {t('subtitle')}
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1.5 rtl:space-x-reverse text-sm font-medium text-white/90">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl hover:bg-white/15 hover:text-white transition-all font-semibold"
            >
              {t('overview')}
            </Link>
            {user?.role === 'STUDENT' && (
              <>
                <Link
                  href="/student"
                  className="px-3.5 py-2 rounded-xl hover:bg-white/15 hover:text-white transition-all font-semibold"
                >
                  {t('dashboard')}
                </Link>
                <Link
                  href="/student/apply"
                  className="px-3.5 py-2 rounded-xl hover:bg-white/15 hover:text-white transition-all font-semibold"
                >
                  {t('applyNow')}
                </Link>
              </>
            )}
            {user?.role === 'COORDINATOR' && (
              <Link
                href="/coordinator"
                className="px-3.5 py-2 rounded-xl hover:bg-white/15 hover:text-white transition-all font-semibold"
              >
                {t('coordinatorPortal')}
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-3.5 py-2 rounded-xl hover:bg-white/15 hover:text-white transition-all font-semibold"
              >
                {t('adminCenter')}
              </Link>
            )}
            {user?.role === 'DEALER' && (
              <Link
                href="/dealer"
                className="px-3.5 py-2 rounded-xl hover:bg-white/15 hover:text-white transition-all font-semibold"
              >
                {t('dealerPortal')}
              </Link>
            )}
          </div>

          {/* Right Section: User Actions */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {user ? (
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="text-right rtl:text-left hidden sm:block">
                  <div className="text-sm font-bold text-white leading-tight font-serif">
                    {user.fullName}
                  </div>
                  <div className="text-[11px] text-emerald-200 flex items-center justify-end rtl:justify-start gap-1 mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                    <span>{user.role}</span>
                  </div>
                </div>
                <button
                  id="logout-btn"
                  onClick={logout}
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all shadow-sm"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 transition-all shadow-sm whitespace-nowrap"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-xl bg-white text-[#0A6E66] hover:bg-emerald-50 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/15 text-white border border-white/20"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-5 space-y-2 bg-[#0E8C82]/95 border-t border-white/15 shadow-2xl backdrop-blur-xl">
          <Link href="/" className="block px-3.5 py-2.5 rounded-xl text-white font-semibold hover:bg-white/15">
            {t('overview')}
          </Link>
          {user?.role === 'STUDENT' && (
            <>
              <Link href="/student" className="block px-3.5 py-2.5 rounded-xl text-white font-semibold hover:bg-white/15">
                {t('dashboard')}
              </Link>
              <Link href="/student/apply" className="block px-3.5 py-2.5 rounded-xl text-white font-semibold hover:bg-white/15">
                {t('applyNow')}
              </Link>
            </>
          )}
          {user?.role === 'COORDINATOR' && (
            <Link href="/coordinator" className="block px-3.5 py-2.5 rounded-xl text-white font-semibold hover:bg-white/15">
              {t('coordinatorPortal')}
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="block px-3.5 py-2.5 rounded-xl text-white font-semibold hover:bg-white/15">
              {t('adminCenter')}
            </Link>
          )}
          {user?.role === 'DEALER' && (
            <Link href="/dealer" className="block px-3.5 py-2.5 rounded-xl text-white font-semibold hover:bg-white/15">
              {t('dealerPortal')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
