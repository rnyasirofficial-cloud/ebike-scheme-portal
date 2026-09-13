import { describe, it, expect } from 'vitest';
import { EligibilityService } from '../src/services/eligibility.service';
import { RejectionReason, EligibilityEvaluationInput } from '@ebike/shared';

describe('EligibilityService - Statutory Rule Validation', () => {
  const service = new EligibilityService();

  const validMockInput: EligibilityEvaluationInput = {
    dob: '2002-05-10', // age 24+ in 2026
    cnic: '35201-1234567-1',
    domicileDistrict: 'Lahore',
    licenseNumber: 'LHR-DL-2023-9999',
    licenseExpiry: '2028-12-31',
    universityId: 'uni-punjab-hec-valid',
    isRegularStudent: true,
    attendanceRate: 85.0,
    hasProbation: false,
    walletType: 'BANK_ACCOUNT',
    bankIban: 'PK36BAHL0001234567890123',
  };

  it('passes when all 9 rules are strictly satisfied', async () => {
    const result = await service.evaluate(validMockInput, new Date('2026-09-13'));
    expect(result.eligible).toBe(true);
    expect(result.failedRules).toHaveLength(0);
  });

  it('Rule 1: Rejects applicant under 18 years of age with AGE_BELOW_18', async () => {
    const input: EligibilityEvaluationInput = {
      ...validMockInput,
      dob: '2012-05-10', // 14 years old
    };
    const result = await service.evaluate(input, new Date('2026-09-13'));
    expect(result.eligible).toBe(false);
    expect(result.failedRules).toContain(RejectionReason.AGE_BELOW_18);
  });

  it('Rule 2: Rejects invalid or expired CNIC with INVALID_NADRA_CNIC', async () => {
    const input: EligibilityEvaluationInput = {
      ...validMockInput,
      cnic: '00000-0000000-0', // triggers mock invalid
    };
    const result = await service.evaluate(input, new Date('2026-09-13'));
    expect(result.eligible).toBe(false);
    expect(result.failedRules).toContain(RejectionReason.INVALID_NADRA_CNIC);
  });

  it('Rule 3: Rejects applicant without Punjab domicile with NON_PUNJAB_DOMICILE', async () => {
    const input: EligibilityEvaluationInput = {
      ...validMockInput,
      domicileDistrict: 'Karachi Central', // Sindh district
    };
    const result = await service.evaluate(input, new Date('2026-09-13'));
    expect(result.eligible).toBe(false);
    expect(result.failedRules).toContain(RejectionReason.NON_PUNJAB_DOMICILE);
  });

  it('Rule 4: Rejects expired or invalid driving license with INVALID_DRIVING_LICENSE', async () => {
    const input: EligibilityEvaluationInput = {
      ...validMockInput,
      licenseNumber: 'LHR-EXPIRED-999',
      licenseExpiry: '2023-01-01',
    };
    const result = await service.evaluate(input, new Date('2026-09-13'));
    expect(result.eligible).toBe(false);
    expect(result.failedRules).toContain(RejectionReason.INVALID_DRIVING_LICENSE);
  });

  it('Rule 5: Rejects distance-learning or non-regular student with NON_REGULAR_STUDENT', async () => {
    const input: EligibilityEvaluationInput = {
      ...validMockInput,
      isRegularStudent: false,
    };
    const result = await service.evaluate(input, new Date('2026-09-13'));
    expect(result.eligible).toBe(false);
    expect(result.failedRules).toContain(RejectionReason.NON_REGULAR_STUDENT);
  });

  it('Rule 6: Rejects unrecognized institution with UNRECOGNIZED_HEC_INSTITUTION', async () => {
    const input: EligibilityEvaluationInput = {
      ...validMockInput,
      universityId: 'invalid-unrecognized-uni',
    };
    const result = await service.evaluate(input, new Date('2026-09-13'));
    expect(result.eligible).toBe(false);
    expect(result.failedRules).toContain(RejectionReason.UNRECOGNIZED_HEC_INSTITUTION);
  });

  it('Rule 7: Rejects academic probation or low attendance (<75%) with ACADEMIC_PROBATION_FAILED', async () => {
    const probationInput: EligibilityEvaluationInput = {
      ...validMockInput,
      hasProbation: true,
    };
    const probationResult = await service.evaluate(probationInput, new Date('2026-09-13'));
    expect(probationResult.eligible).toBe(false);
    expect(probationResult.failedRules).toContain(RejectionReason.ACADEMIC_PROBATION_FAILED);

    const lowAttendanceInput: EligibilityEvaluationInput = {
      ...validMockInput,
      attendanceRate: 64.0, // below 75%
    };
    const attendanceResult = await service.evaluate(lowAttendanceInput, new Date('2026-09-13'));
    expect(attendanceResult.eligible).toBe(false);
    expect(attendanceResult.failedRules).toContain(RejectionReason.ACADEMIC_PROBATION_FAILED);
  });

  it('Rule 8: Rejects duplicate beneficiary if bike previously received', async () => {
    // Mock prisma client with existing beneficiary record and valid university
    const mockPrismaWithDuplicate = {
      application: {
        findFirst: async () => ({ id: 'existing-app-123', status: 'DELIVERED' }),
      },
      university: {
        findUnique: async () => ({
          id: 'uni-punjab-hec-valid',
          hecRecognized: true,
          province: 'Punjab',
          isActive: true,
        }),
      },
    } as any;

    const dupService = new EligibilityService(mockPrismaWithDuplicate);
    const result = await dupService.evaluate(validMockInput, new Date('2026-09-13'));
    expect(result.eligible).toBe(false);
    expect(result.failedRules).toContain(RejectionReason.DUPLICATE_BENEFICIARY_CNIC);
  });

  it('Rule 9: Rejects malformed bank IBAN or mobile wallet with INVALID_FINANCIAL_ACCOUNT', async () => {
    const invalidIbanInput: EligibilityEvaluationInput = {
      ...validMockInput,
      walletType: 'BANK_ACCOUNT',
      bankIban: 'INVALID_123',
    };
    const ibanResult = await service.evaluate(invalidIbanInput, new Date('2026-09-13'));
    expect(ibanResult.eligible).toBe(false);
    expect(ibanResult.failedRules).toContain(RejectionReason.INVALID_FINANCIAL_ACCOUNT);

    const invalidWalletInput: EligibilityEvaluationInput = {
      ...validMockInput,
      walletType: 'JAZZCASH',
      walletNumber: '1234', // invalid format
    };
    const walletResult = await service.evaluate(invalidWalletInput, new Date('2026-09-13'));
    expect(walletResult.eligible).toBe(false);
    expect(walletResult.failedRules).toContain(RejectionReason.INVALID_FINANCIAL_ACCOUNT);
  });
});
