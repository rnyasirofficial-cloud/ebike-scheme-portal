/**
 * Mock Authentication & Data Service
 * Used as fallback when the real Express API backend is unreachable.
 * Enables demo accounts, university selection, and application wizard on Vercel.
 */

import type { User } from './auth-context';

// ── Mock Universities ────────────────────────────────────────────────────────
export interface MockUniversity {
  id: string;
  name: string;
  city: string;
  sector: 'Public' | 'Private';
  hecId: string;
}

export const MOCK_UNIVERSITIES: MockUniversity[] = [
  // Public Universities
  { id: 'pu-001', name: 'University of the Punjab', city: 'Lahore', sector: 'Public', hecId: 'HEC-PB-001' },
  { id: 'pu-002', name: 'University of Engineering & Technology (UET) Lahore', city: 'Lahore', sector: 'Public', hecId: 'HEC-PB-002' },
  { id: 'pu-003', name: 'Government College University (GCU) Lahore', city: 'Lahore', sector: 'Public', hecId: 'HEC-PB-003' },
  { id: 'pu-004', name: 'Lahore College for Women University (LCWU)', city: 'Lahore', sector: 'Public', hecId: 'HEC-PB-004' },
  { id: 'pu-005', name: 'University of Veterinary & Animal Sciences (UVAS)', city: 'Lahore', sector: 'Public', hecId: 'HEC-PB-005' },
  { id: 'pu-006', name: 'Minhaj University Lahore', city: 'Lahore', sector: 'Public', hecId: 'HEC-PB-006' },
  { id: 'pu-007', name: 'Bahauddin Zakariya University (BZU)', city: 'Multan', sector: 'Public', hecId: 'HEC-PB-007' },
  { id: 'pu-008', name: 'University of Agriculture Faisalabad (UAF)', city: 'Faisalabad', sector: 'Public', hecId: 'HEC-PB-008' },
  { id: 'pu-009', name: 'Government College University (GCU) Faisalabad', city: 'Faisalabad', sector: 'Public', hecId: 'HEC-PB-009' },
  { id: 'pu-010', name: 'National Textile University (NTU)', city: 'Faisalabad', sector: 'Public', hecId: 'HEC-PB-010' },
  { id: 'pu-011', name: 'University of Education (UE) Lahore', city: 'Lahore', sector: 'Public', hecId: 'HEC-PB-011' },
  { id: 'pu-012', name: 'University of Gujrat (UOG)', city: 'Gujrat', sector: 'Public', hecId: 'HEC-PB-012' },
  { id: 'pu-013', name: 'University of Sargodha (UOS)', city: 'Sargodha', sector: 'Public', hecId: 'HEC-PB-013' },
  { id: 'pu-014', name: 'Islamia University of Bahawalpur (IUB)', city: 'Bahawalpur', sector: 'Public', hecId: 'HEC-PB-014' },
  { id: 'pu-015', name: 'University of the Punjab Gujranwala Campus', city: 'Gujranwala', sector: 'Public', hecId: 'HEC-PB-015' },
  { id: 'pu-016', name: 'Quaid-e-Azam Medical College Bahawalpur', city: 'Bahawalpur', sector: 'Public', hecId: 'HEC-PB-016' },
  { id: 'pu-017', name: 'Fatima Jinnah Women University Rawalpindi', city: 'Rawalpindi', sector: 'Public', hecId: 'HEC-PB-017' },
  { id: 'pu-018', name: 'PMAS Arid Agriculture University Rawalpindi', city: 'Rawalpindi', sector: 'Public', hecId: 'HEC-PB-018' },
  { id: 'pu-019', name: 'University of Jhang', city: 'Jhang', sector: 'Public', hecId: 'HEC-PB-019' },
  { id: 'pu-020', name: 'University of Okara', city: 'Okara', sector: 'Public', hecId: 'HEC-PB-020' },
  { id: 'pu-021', name: 'University of Sahiwal', city: 'Sahiwal', sector: 'Public', hecId: 'HEC-PB-021' },
  { id: 'pu-022', name: 'University of Narowal', city: 'Narowal', sector: 'Public', hecId: 'HEC-PB-022' },
  { id: 'pu-023', name: 'University of Sialkot', city: 'Sialkot', sector: 'Public', hecId: 'HEC-PB-023' },
  { id: 'pu-024', name: 'Women University Multan', city: 'Multan', sector: 'Public', hecId: 'HEC-PB-024' },
  { id: 'pu-025', name: 'University of Engineering & Technology (UET) Taxila', city: 'Taxila', sector: 'Public', hecId: 'HEC-PB-025' },
  { id: 'pu-026', name: 'Khwaja Fareed University of Engineering & IT (KFUEIT)', city: 'Rahim Yar Khan', sector: 'Public', hecId: 'HEC-PB-026' },
  { id: 'pu-027', name: 'University of Engineering & Technology (UET) Lahore — Faisalabad Campus', city: 'Faisalabad', sector: 'Public', hecId: 'HEC-PB-027' },
  // Private Universities
  { id: 'pr-001', name: 'Lahore University of Management Sciences (LUMS)', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P01' },
  { id: 'pr-002', name: 'COMSATS University Islamabad — Lahore Campus', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P02' },
  { id: 'pr-003', name: 'Forman Christian College University', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P03' },
  { id: 'pr-004', name: 'University of Central Punjab (UCP)', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P04' },
  { id: 'pr-005', name: 'University of Lahore (UOL)', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P05' },
  { id: 'pr-006', name: 'University of Management & Technology (UMT)', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P06' },
  { id: 'pr-007', name: 'Riphah International University Lahore', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P07' },
  { id: 'pr-008', name: 'Superior University Lahore', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P08' },
  { id: 'pr-009', name: 'FAST — National University (NUCES) Lahore', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P09' },
  { id: 'pr-010', name: 'Beaconhouse National University (BNU)', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P10' },
  { id: 'pr-011', name: 'ITU — Information Technology University', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P11' },
  { id: 'pr-012', name: 'Virtual University of Pakistan (Main Campus)', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P12' },
  { id: 'pr-013', name: 'Lahore Leads University', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P13' },
  { id: 'pr-014', name: 'Hajvery University Lahore', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P14' },
  { id: 'pr-015', name: 'University of South Asia (USA) Lahore', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P15' },
  { id: 'pr-016', name: 'Kinnaird College for Women University', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P16' },
  { id: 'pr-017', name: 'University of Faisalabad (TUF)', city: 'Faisalabad', sector: 'Private', hecId: 'HEC-PB-P17' },
  { id: 'pr-018', name: 'Islamia University of Bahawalpur — Private Campus', city: 'Bahawalpur', sector: 'Private', hecId: 'HEC-PB-P18' },
  { id: 'pr-019', name: 'Multan Institute of Technology & Sciences', city: 'Multan', sector: 'Private', hecId: 'HEC-PB-P19' },
  { id: 'pr-020', name: 'COMSATS University — Sahiwal Campus', city: 'Sahiwal', sector: 'Private', hecId: 'HEC-PB-P20' },
  { id: 'pr-021', name: 'COMSATS University — Wah Campus', city: 'Wah Cantt', sector: 'Private', hecId: 'HEC-PB-P21' },
  { id: 'pr-022', name: 'University of Gujranwala (Private)', city: 'Gujranwala', sector: 'Private', hecId: 'HEC-PB-P22' },
  { id: 'pr-023', name: 'Sialkot University', city: 'Sialkot', sector: 'Private', hecId: 'HEC-PB-P23' },
  { id: 'pr-024', name: 'Rawalpindi Medical University', city: 'Rawalpindi', sector: 'Private', hecId: 'HEC-PB-P24' },
  { id: 'pr-025', name: 'Garrison University Lahore', city: 'Lahore', sector: 'Private', hecId: 'HEC-PB-P25' },
];

/** Returns mock universities formatted for API-compatible response */
export function getMockUniversities() {
  return { success: true, data: MOCK_UNIVERSITIES };
}

/** Mock application submit — always succeeds in demo mode */
export function mockSubmitApplication(formData: any) {
  const appNo = `EBS-2026-PB-${Math.floor(100000 + Math.random() * 900000)}`;
  return {
    success: true,
    data: {
      applicationNo: appNo,
      status: 'SUBMITTED',
      message: 'Application submitted successfully (Demo Mode)',
    },
  };
}


export const MOCK_TOKEN_PREFIX = 'mock_demo_';

interface MockCredential {
  identifier: string;
  password: string;
  user: User;
}

const DEMO_USERS: MockCredential[] = [
  {
    identifier: 'student@punjab.gov.pk',
    password: 'DemoPass123!',
    user: {
      id: 'demo-student-001',
      fullName: 'Ali Hassan (Demo)',
      cnic: '35201-1234567-1',
      email: 'student@punjab.gov.pk',
      mobile: '03001234567',
      role: 'STUDENT',
      university: {
        id: 'uni-001',
        name: 'University of the Punjab',
        city: 'Lahore',
      },
    },
  },
  {
    identifier: 'coordinator@pu.edu.pk',
    password: 'DemoPass123!',
    user: {
      id: 'demo-coordinator-001',
      fullName: 'Dr. Sara Malik (Demo)',
      cnic: '35202-9876543-2',
      email: 'coordinator@pu.edu.pk',
      mobile: '03009876543',
      role: 'COORDINATOR',
      university: {
        id: 'uni-001',
        name: 'University of the Punjab',
        city: 'Lahore',
      },
    },
  },
  {
    identifier: 'admin@transport.punjab.gov.pk',
    password: 'AdminPass123!',
    user: {
      id: 'demo-admin-001',
      fullName: 'Director Kamran Ahmed (Demo)',
      cnic: '35203-1122334-3',
      email: 'admin@transport.punjab.gov.pk',
      mobile: '03111234567',
      role: 'ADMIN',
    },
  },
  {
    identifier: 'dealer@honda-ebikes.pk',
    password: 'DealerPass123!',
    user: {
      id: 'demo-dealer-001',
      fullName: 'Metro E-Bikes Dealer (Demo)',
      cnic: '35204-5566778-4',
      email: 'dealer@honda-ebikes.pk',
      mobile: '03214567890',
      role: 'DEALER',
    },
  },
];

/** Try to log in with mock credentials. Returns { token, user } or null. */
export function mockLogin(
  identifier: string,
  password: string
): { token: string; user: User } | null {
  const match = DEMO_USERS.find(
    (d) =>
      (d.identifier === identifier || d.user.cnic === identifier) &&
      d.password === password
  );
  if (!match) return null;

  const token = `${MOCK_TOKEN_PREFIX}${match.user.role.toLowerCase()}_${Date.now()}`;
  // Persist user data so refreshUser can restore it
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${token}_user`, JSON.stringify(match.user));
  }
  return { token, user: match.user };
}

/** Retrieve the user associated with a mock token from localStorage. */
export function getMockUser(token: string): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(`${token}_user`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

/** Check if a token is a mock/demo token. */
export function isMockToken(token: string | null): boolean {
  return !!token && token.startsWith(MOCK_TOKEN_PREFIX);
}

/** Mock register — always succeeds in demo mode. */
export function mockRegister(formData: {
  fullName: string;
  cnic: string;
  mobile: string;
  email: string;
  password: string;
}): { success: true; data: { devMockOtp: string } } {
  return {
    success: true,
    data: { devMockOtp: '123456' },
  };
}

/** Mock OTP verify — accepts '123456' in demo mode. */
export function mockVerifyOtp(
  mobile: string,
  otp: string
): { token: string; user: User } | null {
  if (otp !== '123456') return null;
  // Return a generic student account for registration demo
  const user: User = {
    id: `demo-new-${Date.now()}`,
    fullName: 'New Student (Demo)',
    cnic: '35201-0000000-0',
    email: 'newstudent@demo.pk',
    mobile,
    role: 'STUDENT',
  };
  const token = `${MOCK_TOKEN_PREFIX}student_new_${Date.now()}`;
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${token}_user`, JSON.stringify(user));
  }
  return { token, user };
}
