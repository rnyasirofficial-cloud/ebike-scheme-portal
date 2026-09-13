import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AuditService } from '../services/audit.service';

const prisma = new PrismaClient();
const auditService = new AuditService(prisma);

export class DealerController {
  /**
   * Get Dealer Center inventory status & pending allocation queue
   */
  public static async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const allocations = await prisma.bikeAllocation.findMany({
        include: {
          application: {
            include: {
              student: { select: { fullName: true, cnic: true, mobile: true, email: true } },
              university: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const inventoryStats = {
        centerName: 'Metro E-Bikes Authorized Center (Lahore Hub)',
        stockTotal: 150,
        allocatedCount: allocations.filter((a) => a.status === 'ALLOCATED').length,
        deliveredCount: allocations.filter((a) => a.status === 'DELIVERED').length,
        availableStock: 150 - allocations.length,
      };

      return res.json({ success: true, inventoryStats, allocations });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch dealer data' });
    }
  }

  /**
   * Confirm bike handover via QR code token or allocation ID
   */
  public static async confirmHandover(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      const { qrCodeToken, frameNumber, batterySerialNumber, registrationNumber, remarks } = req.body;

      if (!qrCodeToken) {
        return res.status(400).json({ success: false, message: 'QR Code verification token is required' });
      }

      if (!frameNumber || !batterySerialNumber || !registrationNumber) {
        return res.status(400).json({
          success: false,
          message: 'Bike frame number, battery/warranty serial, and registration number are mandatory.',
        });
      }

      const allocation = await prisma.bikeAllocation.findFirst({
        where: {
          OR: [{ qrCodeToken }, { id: qrCodeToken }],
        },
        include: {
          application: { include: { student: true } },
        },
      });

      if (!allocation) {
        return res.status(404).json({ success: false, message: 'Invalid QR token or allocation not found.' });
      }

      if (allocation.status === 'DELIVERED') {
        return res.status(400).json({ success: false, message: 'This e-bike has already been handed over.' });
      }

      const updatedAllocation = await prisma.bikeAllocation.update({
        where: { id: allocation.id },
        data: {
          status: 'DELIVERED',
          handoverDate: new Date(),
          frameNumber,
          batterySerialNumber,
          registrationNumber,
          dealerId: user?.id,
          remarks,
        },
      });

      // Update Application status to DELIVERED
      await prisma.application.update({
        where: { id: allocation.applicationId },
        data: { status: 'DELIVERED' },
      });

      // Audit log
      await auditService.log({
        entity: 'BikeAllocation',
        entityId: allocation.id,
        action: 'BIKE_DELIVERED',
        performedBy: user?.email || 'dealer',
        details: { frameNumber, registrationNumber, student: allocation.application.student.fullName },
      });

      // Notify student
      await prisma.notification.create({
        data: {
          userId: allocation.application.studentId,
          title: '🏍️ E-Bike Handover Complete!',
          message: `Your electric bike (Reg #${registrationNumber}) has been delivered! Warranty & battery serial #${batterySerialNumber} have been recorded. Ride safely!`,
          type: 'SUCCESS',
        },
      });

      return res.json({
        success: true,
        message: 'E-Bike handover successfully confirmed and registered.',
        data: updatedAllocation,
      });
    } catch (err: any) {
      console.error('Handover error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
