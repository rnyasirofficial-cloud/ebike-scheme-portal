export interface NadraCitizenRecord {
  cnic: string;
  fullName: string;
  dob: string; // YYYY-MM-DD
  isExpired: boolean;
  isValid: boolean;
  domicileProvince: string;
}

export class MockNadraVerisysService {
  /**
   * Verifies CNIC validity, status, and retrieves official citizen record
   */
  public static async verifyCnic(cnic: string): Promise<NadraCitizenRecord | null> {
    // Normalization
    const cleanCnic = cnic.trim();
    if (!/^\d{5}-\d{7}-\d{1}$/.test(cleanCnic)) {
      return null;
    }

    // Special mock test cases for simulation
    if (cleanCnic === '00000-0000000-0' || cleanCnic.endsWith('999-9')) {
      return {
        cnic: cleanCnic,
        fullName: 'Unknown Citizen',
        dob: '2010-01-01',
        isExpired: true,
        isValid: false,
        domicileProvince: 'Unknown',
      };
    }

    return {
      cnic: cleanCnic,
      fullName: 'Verified Citizen',
      dob: '2003-01-15',
      isExpired: false,
      isValid: true,
      domicileProvince: 'Punjab',
    };
  }
}
