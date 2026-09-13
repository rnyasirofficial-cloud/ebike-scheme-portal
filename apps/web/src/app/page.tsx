'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { apiRequest } from '@/lib/api';
import {
  Bike,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  CreditCard,
  Search,
  Building2,
  Users,
  ChevronRight,
  HelpCircle,
  Zap,
  Percent,
  Award,
  Clock,
  ChevronDown,
  Calculator,
} from 'lucide-react';

export default function LandingPage() {
  const { user, t } = useAuth();
  const [universities, setUniversities] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    apiRequest('/universities').then((res) => {
      if (res.success && res.data) {
        setUniversities(res.data);
      }
    });
  }, []);

  const filteredUnis = universities.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'ALL' || u.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  const faqs = [
    {
      q: 'Can students with a Motorcycle Learner Permit apply?',
      a: 'Yes! Both regular motorcycle driving licenses and valid learner permits issued by Punjab Excise & Taxation are accepted and verified automatically.',
    },
    {
      q: 'Which universities in Punjab are eligible?',
      a: 'All 52+ HEC-recognized public and private sector degree-awarding institutions and universities located in Punjab are eligible. Distance-learning is excluded.',
    },
    {
      q: 'How is the 50% government subsidy calculated?',
      a: 'The Government of Punjab finances 50% of the total bike cost (Rs. 108,000) as a direct grant. The student repays the remaining Rs. 108,000 in 24 equal monthly installments of Rs. 4,500 with zero mark-up.',
    },
    {
      q: 'How does the balloting / lottery selection draw work?',
      a: 'Once your university coordinator verifies your enrollment and attendance (≥75%), your application enters the automated, cryptographically fair e-balloting draw administered by PITB and the Transport Department.',
    },
    {
      q: 'Where do selected students collect their electric bikes?',
      a: 'Selected students receive an authenticated digital QR code voucher and are assigned to their nearest authorized Metro E-Bikes dealership center based on campus proximity.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col font-sans">
      {/* ========================================================= */}
      {/* HERO SECTION — Lush Green/Teal Gradient with High-Tech EV Card */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-gradient-chrome pt-10 pb-16 sm:pt-14 sm:pb-20 text-white shadow-2xl border-b border-white/10">
        {/* Subtle Ambient Glow Spheres */}
        <div className="absolute -top-24 -right-24 w-[32rem] h-[32rem] rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-emerald-300/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Official Ribbon Badge with CM Maryam Nawaz Animated Avatar */}
              <div className="inline-flex items-center gap-3 pr-4 pl-1.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-emerald-100 shadow-md">
                <img
                  src="/cm-maryam-avatar.jpg"
                  alt="Chief Minister Maryam Nawaz Sharif"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-300/80 shadow-sm"
                />
                <div className="flex items-center gap-2">
                  <span>Chief Minister Maryam Nawaz Sharif Vision</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] uppercase font-bold tracking-wider text-white">
                    2026 Phase-I
                  </span>
                </div>
              </div>

              {/* Main Headline in Majestic Lora Typography */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-normal leading-snug text-white">
                Empowering Students <br className="hidden sm:inline" />
                with <span className="text-emerald-200">Green Mobility</span>
              </h1>

              {/* Subtitle / Lead Paragraph */}
              <p className="text-sm sm:text-base text-emerald-50/95 max-w-xl font-normal leading-relaxed">
                Ride towards a cleaner future. Eligible university and college students across Punjab can now apply for subsidized electric bikes with 50% government grant support and interest-free, manageable installments.
              </p>

              {/* Action Buttons Row */}
              <div className="pt-1 flex flex-wrap items-center gap-3.5">
                <Link
                  id="hero-apply-btn"
                  href={user ? '/student/apply' : '/register'}
                  className="px-6 py-3.5 rounded-xl bg-white text-[#0A6E66] hover:bg-emerald-50 font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group transform hover:-translate-y-0.5"
                >
                  <span>{t('applyNow')}</span>
                  <ArrowRight className="w-4 h-4 text-[#0E8C82] group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  id="hero-status-btn"
                  href={user ? '/student' : '/login'}
                  className="px-6 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm sm:text-base backdrop-blur-md border border-white/30 transition-all shadow-md transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-emerald-200" />
                  <span>{t('checkStatus')}</span>
                </Link>
              </div>

              {/* 3 Metric Cards in Frosted Glass */}
              <div className="pt-2 grid grid-cols-3 gap-3 max-w-lg">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold">
                    <Percent className="w-3.5 h-3.5" />
                    <span>Govt Grant</span>
                  </div>
                  <div className="mt-1 font-serif text-xl sm:text-2xl font-bold text-white">50%</div>
                  <div className="text-[11px] text-emerald-100/80">Direct Subsidy</div>
                </div>

                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Monthly</span>
                  </div>
                  <div className="mt-1 font-serif text-xl sm:text-2xl font-bold text-white">Rs. 4,500</div>
                  <div className="text-[11px] text-emerald-100/80">Zero Mark-up</div>
                </div>

                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
                  <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold">
                    <Bike className="w-3.5 h-3.5" />
                    <span>Total Quota</span>
                  </div>
                  <div className="mt-1 font-serif text-xl sm:text-2xl font-bold text-white">10,000+</div>
                  <div className="text-[11px] text-emerald-100/80">Punjab Students</div>
                </div>
              </div>
            </div>

            {/* Right Showcase Column: High-Tech EV Card with Real Image */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-white/10 backdrop-blur-xl border border-white/25 p-5 shadow-2xl text-white">
                {/* Image Container */}
                <div className="relative w-full h-48 sm:h-52 rounded-2xl overflow-hidden shadow-inner border border-white/20 group">
                  <img
                    src="/ebike-hero.jpg"
                    alt="Punjab E-Glide 1000 High-Range Electric Bike"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/10" />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/85 text-white backdrop-blur-md border border-emerald-300/40 shadow-sm">
                      <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                      <span>Eco Certified</span>
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h2 className="font-serif text-lg font-bold text-white leading-tight drop-shadow-sm">
                      Punjab E-Glide 1000 Series
                    </h2>
                    <p className="text-xs text-emerald-200">72V High-Torque Lithium Electric Bike</p>
                  </div>
                </div>

                {/* 2x2 Key Specification Badges */}
                <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                    <span className="text-emerald-200 block text-[11px]">Battery Range:</span>
                    <span className="font-bold text-xs sm:text-sm text-white">85 km per charge</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                    <span className="text-emerald-200 block text-[11px]">Battery Warranty:</span>
                    <span className="font-bold text-xs sm:text-sm text-white">3 Years Full</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                    <span className="text-emerald-200 block text-[11px]">Installment Plan:</span>
                    <span className="font-bold text-xs sm:text-sm text-white">24 Mos (0% Mark-up)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                    <span className="text-emerald-200 block text-[11px]">Verification Engine:</span>
                    <span className="font-bold text-xs sm:text-sm text-white">NADRA & HEC Direct</span>
                  </div>
                </div>

                {/* Bottom Card Footer */}
                <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Transparent E-Balloting Draw</span>
                  </span>
                  <span className="font-semibold text-white">PITB Portal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9 STATUTORY ELIGIBILITY CRITERIA CARDS */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#0A6E66] font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Automated Criteria Engine</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Statutory Eligibility Rules
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Every applicant is evaluated automatically across all 9 criteria via real-time NADRA, Excise, and HEC registry integrations.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              rule: '01',
              title: 'Age 18+ on Application Date',
              desc: 'Applicant must be at least 18 years old on application date, verified from CNIC/B-Form birth date.',
              badge: 'Rule 1',
            },
            {
              rule: '02',
              title: 'Valid NADRA CNIC / B-Form',
              desc: 'Unexpired CNIC/B-Form registered to the applicant with authentic NADRA Verisys verification.',
              badge: 'Rule 2',
            },
            {
              rule: '03',
              title: 'Punjab Domicile Certificate',
              desc: 'Valid domicile certificate issued by any of the 42 official districts within Punjab province.',
              badge: 'Rule 3',
            },
            {
              rule: '04',
              title: 'Motorcycle License / Learner',
              desc: 'Valid regular motorcycle license or active learner permit verified with Punjab Excise & Taxation.',
              badge: 'Rule 4',
            },
            {
              rule: '05',
              title: 'Regular On-Campus Student',
              desc: 'Currently enrolled regular student. Distance-learning and external candidates are strictly ineligible.',
              badge: 'Rule 5',
            },
            {
              rule: '06',
              title: 'HEC-Recognized Punjab HEI',
              desc: 'Enrolled in an institution listed in the official HEC directory located in Punjab province.',
              badge: 'Rule 6',
            },
            {
              rule: '07',
              title: 'Good Academic Standing',
              desc: 'No active academic probation and minimum 75% attendance attested by university coordinator.',
              badge: 'Rule 7',
            },
            {
              rule: '08',
              title: 'One Bike per CNIC Rule',
              desc: 'Applicant must not have previously received an electric bike under this or prior scheme cycles.',
              badge: 'Rule 8',
            },
            {
              rule: '09',
              title: 'Active Bank / Mobile Wallet',
              desc: 'Active personal Pakistani IBAN or registered mobile wallet (JazzCash / Easypaisa) for installments.',
              badge: 'Rule 9',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                idx % 2 === 0 ? 'kpi-card-green' : 'kpi-card-blue'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-white text-slate-800 shadow-sm border border-slate-200">
                  {item.badge}
                </span>
                <CheckCircle2 className="w-5 h-5 text-[#0E8C82]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-slate-900 leading-snug">
                {item.title}
              </h3>
              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed font-sans">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* INTERACTIVE SUBSIDY & INSTALLMENT BREAKDOWN */}
      {/* ========================================================= */}
      <section className="py-16 bg-white/70 border-y border-slate-200/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#1565C0] font-bold text-xs">
                <Calculator className="w-3.5 h-3.5" />
                <span>Financial Transparency</span>
              </div>
              <h2 className="font-serif text-3xl font-extrabold text-slate-900 leading-snug">
                Zero Mark-Up Financial Subsidy Breakdown
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The Government of Punjab covers half of the retail price as a non-repayable public grant, keeping monthly student repayments completely affordable.
              </p>
              <div className="pt-2 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>No bank processing fee, documentation fee, or hidden charges.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>0% Interest / Zero Markup across the full 24-month tenure.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Includes comprehensive 3-year replacement warranty on battery.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total E-Bike Retail Price
                  </span>
                  <span className="font-serif text-xl font-bold text-slate-900">
                    Rs. 216,000
                  </span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-slate-100 text-emerald-700">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Punjab Govt Subsidy Grant (50%)
                  </span>
                  <span className="font-serif text-xl font-bold">
                    - Rs. 108,000 (Free)
                  </span>
                </div>

                <div className="flex justify-between items-center pb-4 border-b border-slate-100 text-[#1565C0]">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Net Student Loan Principal
                  </span>
                  <span className="font-serif text-xl font-bold">
                    Rs. 108,000
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                      Monthly Installment (24 Months)
                    </span>
                    <span className="text-[11px] text-emerald-700">Due 1st of each calendar month</span>
                  </div>
                  <span className="font-serif text-3xl font-extrabold text-[#0A6E66]">
                    Rs. 4,500
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* HEC RECOGNIZED PUNJAB UNIVERSITIES DIRECTORY */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-[#0A6E66] font-bold text-xs mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>HEC Punjab Official Registry</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Eligible Punjab Universities
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Search the maintained directory of 52+ HEC-recognized higher education institutions across Punjab.
            </p>
          </div>

          {/* Search & Sector Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search university or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0E8C82] shadow-sm bg-white"
              />
            </div>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-[#0E8C82] shadow-sm"
            >
              <option value="ALL">All Sectors ({universities.length})</option>
              <option value="Public">Public Sector</option>
              <option value="Private">Private Sector</option>
            </select>
          </div>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnis.slice(0, 9).map((uni) => (
            <div
              key={uni.id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-[#0E8C82] hover:shadow-md transition-all shadow-sm flex items-start gap-4"
            >
              <div className="p-3 rounded-xl bg-emerald-50 text-[#0E8C82] flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-serif text-sm font-bold text-slate-900 leading-snug">
                  {uni.name}
                </h4>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700 text-[10px]">
                    {uni.sector}
                  </span>
                  <span>{uni.city}, Punjab</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0E8C82] hover:text-[#0A6E66] transition group"
          >
            <span>Complete list of 52+ universities available in the Application Wizard</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4-STEP BENEFICIARY APPLICATION JOURNEY */}
      {/* ========================================================= */}
      <section className="py-20 bg-white/70 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Simple 4-Step Application Flow
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From online registration to picking up your electric bike at your local center.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Sign Up & Verify',
                desc: 'Register with CNIC and Mobile OTP. Automated age and license validation.',
              },
              {
                step: '02',
                title: 'Complete Wizard',
                desc: 'Select your Punjab HEC institution, provide student roll number, and upload documents.',
              },
              {
                step: '03',
                title: 'Campus Attestation',
                desc: 'University coordinator verifies attendance (≥75%) and confirms good academic standing.',
              },
              {
                step: '04',
                title: 'Balloting & Pickup',
                desc: 'Transparent e-balloting draw selects beneficiaries. Collect bike via QR pickup voucher.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col items-center text-center relative hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-chrome text-white font-serif font-extrabold text-xl flex items-center justify-center shadow-md mb-5">
                  {item.step}
                </div>
                <h3 className="font-serif text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FREQUENTLY ASKED QUESTIONS (ACCORDION) */}
      {/* ========================================================= */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-[#1565C0] font-bold text-xs">
            <HelpCircle className="w-4 h-4" />
            <span>Applicant Helpdesk</span>
          </div>
          <h2 className="font-serif text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Answers to common questions regarding eligibility, documentation, and handover.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                >
                  <span className="font-serif font-bold text-sm sm:text-base text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-[#0E8C82]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
