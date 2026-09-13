import { z } from 'zod';

export enum Role {
  STUDENT = 'STUDENT',
  COORDINATOR = 'COORDINATOR',
  ADMIN = 'ADMIN',
  DEALER = 'DEALER',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
}

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SELECTED = 'SELECTED',
  ALLOCATED = 'ALLOCATED',
  DELIVERED = 'DELIVERED',
}

export enum SelectionMode {
  FCFS = 'FCFS',
  MERIT_SCORE = 'MERIT_SCORE',
  LOTTERY = 'LOTTERY',
}

export enum DocumentType {
  CNIC_FRONT = 'CNIC_FRONT',
  CNIC_BACK = 'CNIC_BACK',
  DOMICILE = 'DOMICILE',
  LICENSE = 'LICENSE',
  STUDENT_CARD = 'STUDENT_CARD',
  ATTESTATION = 'ATTESTATION',
}

export enum RejectionReason {
  AGE_BELOW_18 = 'AGE_BELOW_18',
  INVALID_NADRA_CNIC = 'INVALID_NADRA_CNIC',
  NON_PUNJAB_DOMICILE = 'NON_PUNJAB_DOMICILE',
  INVALID_DRIVING_LICENSE = 'INVALID_DRIVING_LICENSE',
  NON_REGULAR_STUDENT = 'NON_REGULAR_STUDENT',
  UNRECOGNIZED_HEC_INSTITUTION = 'UNRECOGNIZED_HEC_INSTITUTION',
  ACADEMIC_PROBATION_FAILED = 'ACADEMIC_PROBATION_FAILED',
  DUPLICATE_BENEFICIARY_CNIC = 'DUPLICATE_BENEFICIARY_CNIC',
  INVALID_FINANCIAL_ACCOUNT = 'INVALID_FINANCIAL_ACCOUNT',
  COORDINATOR_DISQUALIFIED = 'COORDINATOR_DISQUALIFIED',
}

export const RejectionReasonLabels: Record<RejectionReason, string> = {
  [RejectionReason.AGE_BELOW_18]: 'Applicant must be at least 18 years old on the date of application (NADRA record check)',
  [RejectionReason.INVALID_NADRA_CNIC]: 'CNIC/B-Form is expired, invalid, or could not be verified via NADRA Verisys',
  [RejectionReason.NON_PUNJAB_DOMICILE]: 'Applicant does not hold a valid Punjab domicile certificate',
  [RejectionReason.INVALID_DRIVING_LICENSE]: 'Applicant must hold a valid unexpired motorcycle learner or regular driving license (Excise check)',
  [RejectionReason.NON_REGULAR_STUDENT]: 'Applicant is not enrolled as a regular, on-campus student (distance learning is ineligible)',
  [RejectionReason.UNRECOGNIZED_HEC_INSTITUTION]: 'Selected institution is not an active HEC-recognized university/college in Punjab',
  [RejectionReason.ACADEMIC_PROBATION_FAILED]: 'Applicant is on active academic probation or does not satisfy minimum attendance (75%)',
  [RejectionReason.DUPLICATE_BENEFICIARY_CNIC]: 'CNIC has already received an e-bike in this or a prior government cycle',
  [RejectionReason.INVALID_FINANCIAL_ACCOUNT]: 'Invalid or unverified IBAN or authorized mobile wallet (JazzCash / Easypaisa)',
  [RejectionReason.COORDINATOR_DISQUALIFIED]: 'Disqualified during institutional verification by university coordinator',
};

// Validation Schemas
export const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
export const MOBILE_REGEX = /^03\d{9}$/;
export const IBAN_REGEX = /^PK\d{2}[A-Z]{4}\d{16}$/;

export const RegisterStudentSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  cnic: z.string().regex(CNIC_REGEX, 'CNIC must be formatted as 00000-0000000-0'),
  mobile: z.string().regex(MOBILE_REGEX, 'Mobile number must be in format 03XXXXXXXXX'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginSchema = z.object({
  identifier: z.string().min(1, 'CNIC or Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const VerifyOtpSchema = z.object({
  mobile: z.string().regex(MOBILE_REGEX),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const ApplicationFormSchema = z.object({
  // Personal & CNIC
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  fatherName: z.string().min(2, "Father/Guardian's name is required"),
  address: z.string().min(5, 'Residential address is required'),
  domicileDistrict: z.string().min(2, 'Punjab domicile district is required'),
  
  // Driving license
  licenseNumber: z.string().min(3, 'License / Learner permit number is required'),
  licenseType: z.enum(['LEARNER', 'PERMANENT']),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
  
  // University details
  universityId: z.string().min(1, 'Please select an HEC-recognized Punjab university'),
  degreeProgram: z.string().min(2, 'Degree program is required (e.g., BS Computer Science)'),
  rollNumber: z.string().min(2, 'University roll/registration number is required'),
  currentSemester: z.number().min(1).max(12),
  cgpa: z.number().min(0).max(4.0).optional(),
  attendanceRate: z.number().min(0).max(100),
  isRegularStudent: z.boolean().refine(val => val === true, {
    message: 'Only regular on-campus students are eligible',
  }),
  hasProbation: z.boolean(),

  // Financial & Household
  bankIban: z.string().optional(),
  walletType: z.enum(['JAZZCASH', 'EASYPAISA', 'BANK_ACCOUNT']),
  walletNumber: z.string().optional(),
  householdMonthlyIncome: z.number().min(0, 'Monthly household income is required'),
  isDifferentlyAbled: z.boolean().default(false),
  
  // Digital consent
  agreedToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and declarations',
  }),
  signatureName: z.string().min(2, 'Digital signature is required'),
});

export type RegisterStudentInput = z.infer<typeof RegisterStudentSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type ApplicationFormInput = z.infer<typeof ApplicationFormSchema>;

export interface EligibilityEvaluationInput {
  dob: string;
  cnic: string;
  domicileDistrict: string;
  licenseNumber: string;
  licenseExpiry: string;
  universityId: string;
  isRegularStudent: boolean;
  attendanceRate: number;
  hasProbation: boolean;
  bankIban?: string;
  walletNumber?: string;
  walletType: 'JAZZCASH' | 'EASYPAISA' | 'BANK_ACCOUNT';
}

export interface EligibilityResult {
  eligible: boolean;
  failedRules: RejectionReason[];
  reasonCodes: string[];
  reasons: string[];
}
