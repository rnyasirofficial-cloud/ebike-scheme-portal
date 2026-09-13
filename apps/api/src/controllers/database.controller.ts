import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export class DatabaseController {
  /**
   * Get database status, engine info, table row counts, and storage metrics
   */
  public static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
      const isSqlite = dbUrl.startsWith('file:');
      let dbSizeFormatted = 'N/A';

      if (isSqlite) {
        const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
        if (fs.existsSync(dbPath)) {
          const stats = fs.statSync(dbPath);
          dbSizeFormatted = `${(stats.size / 1024).toFixed(1)} KB`;
        }
      }

      const [
        usersCount,
        universitiesCount,
        applicationsCount,
        documentsCount,
        paymentsCount,
        bikeAllocationsCount,
        dealershipCentersCount,
        bikeModelsCount,
        ticketsCount,
        notificationsCount,
        auditLogsCount,
        registryLogsCount,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.university.count(),
        prisma.application.count(),
        prisma.document.count(),
        prisma.payment.count(),
        prisma.bikeAllocation.count(),
        prisma.dealershipCenter.count(),
        prisma.bikeModel.count(),
        prisma.supportTicket.count(),
        prisma.notification.count(),
        prisma.auditLog.count(),
        prisma.registryLog.count(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          engine: isSqlite ? 'SQLite 3 (Local Embedded DB)' : 'PostgreSQL Enterprise',
          databaseUrl: isSqlite ? 'file:./prisma/dev.db' : 'postgresql://...[connected]',
          size: dbSizeFormatted,
          status: 'HEALTHY',
          uptimeSeconds: process.uptime(),
          tables: {
            users: usersCount,
            universities: universitiesCount,
            applications: applicationsCount,
            documents: documentsCount,
            payments: paymentsCount,
            bikeAllocations: bikeAllocationsCount,
            dealershipCenters: dealershipCentersCount,
            bikeModels: bikeModelsCount,
            supportTickets: ticketsCount,
            notifications: notificationsCount,
            auditLogs: auditLogsCount,
            registryLogs: registryLogsCount,
          },
          externalRegistries: [
            { name: 'NADRA Verisys Citizen Database', status: 'CONNECTED_SIMULATED', latencyMs: 38 },
            { name: 'Punjab Excise & Taxation Vehicle / License Registry', status: 'CONNECTED_SIMULATED', latencyMs: 44 },
            { name: 'HEC Pakistan Recognized Universities Directory', status: 'CONNECTED_VERIFIED', latencyMs: 25 },
            { name: 'Punjab PITB E-Balloting Algorithm Engine', status: 'CONNECTED_READY', latencyMs: 12 },
          ],
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Database query error', error: error.message });
    }
  }

  /**
   * Browse table records for exploration
   */
  public static async getTableRecords(req: Request, res: Response): Promise<void> {
    try {
      const { tableName } = req.params;
      let records: any[] = [];

      switch (tableName.toLowerCase()) {
        case 'users':
          records = await prisma.user.findMany({
            take: 25,
            select: { id: true, fullName: true, cnic: true, email: true, mobile: true, role: true, isVerified: true, createdAt: true },
          });
          break;
        case 'universities':
          records = await prisma.university.findMany({ take: 25 });
          break;
        case 'applications':
          records = await prisma.application.findMany({
            take: 25,
            include: { student: { select: { fullName: true, cnic: true } }, university: { select: { name: true, city: true } } },
          });
          break;
        case 'dealers':
        case 'dealershipcenters':
          records = await prisma.dealershipCenter.findMany({ take: 25 });
          break;
        case 'bikemodels':
          records = await prisma.bikeModel.findMany({ take: 25 });
          break;
        case 'payments':
          records = await prisma.payment.findMany({ take: 25 });
          break;
        case 'bikeallocations':
          records = await prisma.bikeAllocation.findMany({ take: 25 });
          break;
        case 'auditlogs':
          records = await prisma.auditLog.findMany({ take: 25, orderBy: { timestamp: 'desc' } });
          break;
        case 'registrylogs':
          records = await prisma.registryLog.findMany({ take: 25, orderBy: { checkedAt: 'desc' } });
          break;
        default:
          res.status(400).json({ success: false, message: `Unknown or restricted table: ${tableName}` });
          return;
      }

      res.status(200).json({ success: true, count: records.length, data: records });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to retrieve table records', error: error.message });
    }
  }

  /**
   * Export all database records as portable JSON backup
   */
  public static async exportBackup(req: Request, res: Response): Promise<void> {
    try {
      const [
        users,
        universities,
        applications,
        documents,
        payments,
        bikeAllocations,
        dealershipCenters,
        bikeModels,
        tickets,
        notifications,
        auditLogs,
        registryLogs,
      ] = await Promise.all([
        prisma.user.findMany({ select: { id: true, cnic: true, fullName: true, email: true, mobile: true, role: true, isVerified: true, universityId: true } }),
        prisma.university.findMany(),
        prisma.application.findMany(),
        prisma.document.findMany(),
        prisma.payment.findMany(),
        prisma.bikeAllocation.findMany(),
        prisma.dealershipCenter.findMany(),
        prisma.bikeModel.findMany(),
        prisma.supportTicket.findMany(),
        prisma.notification.findMany(),
        prisma.auditLog.findMany(),
        prisma.registryLog.findMany(),
      ]);

      const backupData = {
        exportedAt: new Date().toISOString(),
        scheme: 'Chief Minister Punjab E-Bike Scheme 2026 Phase-I',
        tables: {
          users,
          universities,
          applications,
          documents,
          payments,
          bikeAllocations,
          dealershipCenters,
          bikeModels,
          tickets,
          notifications,
          auditLogs,
          registryLogs,
        },
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="ebike_portal_database_backup.json"');
      res.status(200).send(JSON.stringify(backupData, null, 2));
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Database export error', error: error.message });
    }
  }
}
