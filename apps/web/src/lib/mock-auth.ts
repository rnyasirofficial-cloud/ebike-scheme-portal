/**
 * Mock Authentication Service
 * Used as fallback when the real Express API backend is unreachable.
 * This enables demo accounts to work on the live Vercel deployment.
 */

import type { User } from './auth-context';

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
