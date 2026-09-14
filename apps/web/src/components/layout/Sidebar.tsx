'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  LayoutDashboard,
  FileText,
  FolderLock,
  Bike,
  CreditCard,
  LifeBuoy,
  Bell,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useAuth();

  const menuItems = [
    { id: 'overview', label: t('overview'), icon: LayoutDashboard, href: '/student' },
    { id: 'application', label: t('myApplication'), icon: FileText, href: '/student#application' },
    { id: 'documents', label: t('documents'), icon: FolderLock, href: '/student#documents' },
    { id: 'allocation', label: t('bikeAllocation'), icon: Bike, href: '/student#allocation' },
    { id: 'payments', label: t('payments'), icon: CreditCard, href: '/student#payments' },
    { id: 'tickets', label: t('supportTickets'), icon: LifeBuoy, href: '/student#tickets' },
    { id: 'notifications', label: t('notifications'), icon: Bell, href: '/student#notifications' },
  ];

  return (
    <aside className="w-56 lg:w-64 bg-[#0A6E66] text-white flex-shrink-0 shadow-lg sidebar-height flex flex-col justify-between hidden md:flex">
      <div className="p-4 space-y-6">
        <div className="px-3 py-2 bg-white/10 rounded-xl">
          <div className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
            Portal Navigation
          </div>
          <div className="text-sm font-medium text-white mt-0.5">
            Student Self-Service
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab ? activeTab === item.id : pathname === item.href;

            if (onTabChange) {
              return (
                <button
                  key={item.id}
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => {
                    onTabChange(item.id);
                    if (typeof window !== 'undefined') {
                      window.location.hash = item.id;
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/20 text-white shadow-sm font-semibold'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-300" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/20 text-white shadow-sm font-semibold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-300" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Quick Support */}
      <div className="p-4 border-t border-white/10 text-xs text-white/70">
        <div className="flex items-center gap-2 mb-1 text-emerald-200 font-semibold">
          <UserCheck className="w-4 h-4" />
          <span>Punjab Transport Helpline</span>
        </div>
        <p>UAN: 042-111-11-2453</p>
        <p className="mt-1 text-[11px] text-white/50">PITB Government E-Services</p>
      </div>
    </aside>
  );
}
