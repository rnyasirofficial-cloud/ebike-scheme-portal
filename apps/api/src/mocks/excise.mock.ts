export interface ExciseLicenseRecord {
  licenseNumber: string;
  category: 'MOTORCYCLE' | 'LEARNER' | 'MOTORCAR_MOTORCYCLE' | 'HTV';
  expiryDate: string; // YYYY-MM-DD
  status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  district: string;
}

export class MockExciseTaxationService {
  /**
   * Verifies driving license or learner permit with Punjab Excise & Taxation database
   */
  public static async verifyLicense(licenseNumber: string): Promise<ExciseLicenseRecord | null> {
    const cleanNum = licenseNumber.trim().toUpperCase();
    if (!cleanNum || cleanNum.length < 3) {
      return null;
    }

    if (cleanNum.includes('INVALID') || cleanNum.includes('EXPIRED')) {
      return {
        licenseNumber: cleanNum,
        category: 'MOTORCYCLE',
        expiryDate: '2023-01-01',
        status: 'EXPIRED',
        district: 'Lahore',
      };
    }

    return {
      licenseNumber: cleanNum,
      category: cleanNum.includes('LRN') ? 'LEARNER' : 'MOTORCYCLE',
      expiryDate: '2028-12-31',
      status: 'ACTIVE',
      district: 'Lahore',
    };
  }
}
