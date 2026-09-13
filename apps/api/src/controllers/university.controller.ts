import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { HecSyncService } from '../services/hec-sync.service';
import { AuditService } from '../services/audit.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const hecSyncService = new HecSyncService(prisma);
const auditService = new AuditService(prisma);

export class UniversityController {
  /**
   * Searchable HEC-Recognized Punjab Universities for Student Wizard
   */
  public static async list(req: Request, res: Response) {
    try {
      const { search, sector, city } = req.query;

      const whereClause: any = {
        province: 'Punjab',
        hecRecognized: true,
        isActive: true,
      };

      if (search) {
        whereClause.OR = [
          { name: { contains: search as string } },
          { city: { contains: search as string } },
        ];
      }

      if (sector && sector !== 'ALL') {
        whereClause.sector = sector as string;
      }

      if (city) {
        whereClause.city = city as string;
      }

      const universities = await prisma.university.findMany({
        where: whereClause,
        orderBy: [{ sector: 'asc' }, { name: 'asc' }],
      });

      return res.json({ success: true, count: universities.length, data: universities });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch universities' });
    }
  }

  /**
   * Admin-triggered HEC Registry Synchronization
   */
  public static async syncFromHec(req: AuthenticatedRequest, res: Response) {
    try {
      const result = await hecSyncService.syncFromRegistry();

      await auditService.log({
        entity: 'UniversityDirectory',
        entityId: 'ALL',
        action: 'HEC_SYNC',
        performedBy: req.user?.email || 'admin',
        details: result,
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Admin-uploaded CSV Import fallback
   */
  public static async uploadCsv(req: AuthenticatedRequest, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ success: false, message: 'Please upload a valid CSV file' });
      }

      const csvString = file.buffer.toString('utf-8');
      const result = await hecSyncService.importFromCsv(csvString);

      await auditService.log({
        entity: 'UniversityDirectory',
        entityId: 'CSV_UPLOAD',
        action: 'IMPORT_CSV',
        performedBy: req.user?.email || 'admin',
        details: result,
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
