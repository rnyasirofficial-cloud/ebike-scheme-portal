import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApplicationFormSchema, Role, ApplicationStatus } from '@ebike/shared';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { EligibilityService } from '../services/eligibility.service';
import { AuditService } from '../services/audit.service';
import { LocalStorageService } from '../services/storage.service';

const prisma = new PrismaClient();
const eligibilityService = new EligibilityService(prisma);
const auditService = new AuditService(prisma);
const storageService = new LocalStorageService();

export class ApplicationController {
  /**
   * Pre-check eligibility without saving (used interactively in wizard)
   */
  public static async preCheckEligibility(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

      const evaluationInput = {
        ...req.body,
        cnic: user.cnic,
      };

      const result = await eligibilityService.evaluate(evaluationInput);
      return res.json({ success: true, result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Submit complete application
   */
  public static async submit(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

      // Check if student already has an active application
      const existing = await prisma.application.findFirst({
        where: { studentId: user.id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `You already have an existing application (${existing.applicationNo}) on file.`,
        });
      }

      const parsed = ApplicationFormSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.errors[0]?.message || 'Application validation failed',
          errors: parsed.error.errors,
        });
      }

      const data = parsed.data;

      // Run strict eligibility engine
      const evaluation = await eligibilityService.evaluate({
        dob: data.dob,
        cnic: user.cnic,
        domicileDistrict: data.domicileDistrict,
        licenseNumber: data.licenseNumber,
        licenseExpiry: data.licenseExpiry,
        universityId: data.universityId,
        isRegularStudent: data.isRegularStudent,
        attendanceRate: data.attendanceRate,
        hasProbation: data.hasProbation,
        walletType: data.walletType,
        bankIban: data.bankIban,
        walletNumber: data.walletNumber,
      });

      if (!evaluation.eligible) {
        return res.status(422).json({
          success: false,
          message: 'Application failed one or more statutory eligibility criteria.',
          rejectionReasons: evaluation.reasons,
          failedRuleCodes: evaluation.failedRules,
        });
      }

      // Generate sequential Application Number
      const appCount = await prisma.application.count();
      const appNo = `EBS-2026-${(appCount + 145).toString().padStart(6, '0')}`;

      // Update student's university association
      await prisma.user.update({
        where: { id: user.id },
        data: { universityId: data.universityId },
      });

      // Create Application
      const application = await prisma.application.create({
        data: {
          applicationNo: appNo,
          studentId: user.id,
          universityId: data.universityId,
          dob: data.dob,
          gender: data.gender,
          fatherName: data.fatherName,
          address: data.address,
          domicileDistrict: data.domicileDistrict,
          licenseNumber: data.licenseNumber,
          licenseType: data.licenseType,
          licenseExpiry: data.licenseExpiry,
          degreeProgram: data.degreeProgram,
          rollNumber: data.rollNumber,
          currentSemester: data.currentSemester,
          cgpa: data.cgpa || 3.0,
          attendanceRate: data.attendanceRate,
          isRegularStudent: data.isRegularStudent,
          hasProbation: data.hasProbation,
          bankIban: data.bankIban,
          walletType: data.walletType,
          walletNumber: data.walletNumber,
          householdMonthlyIncome: data.householdMonthlyIncome,
          isDifferentlyAbled: data.isDifferentlyAbled,
          signatureName: data.signatureName,
          status: ApplicationStatus.SUBMITTED,
        },
      });

      // Create default installment records
      const installments = [
        { month: 1, amount: 4500, due: new Date('2026-10-01') },
        { month: 2, amount: 4500, due: new Date('2026-11-01') },
        { month: 3, amount: 4500, due: new Date('2026-12-01') },
        { month: 4, amount: 4500, due: new Date('2027-01-01') },
      ];

      for (const inst of installments) {
        await prisma.payment.create({
          data: {
            applicationId: application.id,
            installmentNumber: inst.month,
            amount: inst.amount,
            dueDate: inst.due,
            status: 'PENDING',
          },
        });
      }

      // Audit Log
      await auditService.log({
        entity: 'Application',
        entityId: application.id,
        action: 'SUBMITTED',
        performedBy: user.email,
        details: { applicationNo: appNo },
      });

      // Notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Application Submitted Successfully',
          message: `Your application (${appNo}) has been successfully submitted and forwarded to your university coordinator for academic verification.`,
          type: 'SUCCESS',
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application,
      });
    } catch (err: any) {
      console.error('Submit application error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }

  /**
   * Get student's active application with all details
   */
  public static async getMyApplication(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

      const application = await prisma.application.findFirst({
        where: { studentId: user.id },
        include: {
          university: true,
          documents: true,
          payments: { orderBy: { installmentNumber: 'asc' } },
          bikeAllocation: true,
          supportTickets: { orderBy: { createdAt: 'desc' } },
        },
      });

      return res.json({ success: true, data: application });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Error fetching application' });
    }
  }

  /**
   * Upload application document
   */
  public static async uploadDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      const file = req.file;
      const { docType, applicationId } = req.body;

      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      let app = await prisma.application.findUnique({
        where: { id: applicationId },
      });

      if (!app) {
        app = await prisma.application.findFirst({
          where: { studentId: user?.id },
        });
      }

      if (!app) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      const saved = await storageService.saveFile(file, 'documents');

      const doc = await prisma.document.create({
        data: {
          applicationId: app.id,
          docType: docType || 'OTHER',
          filePath: saved.filePath,
          originalName: saved.originalName,
          mimeType: saved.mimeType,
          size: saved.size,
          status: 'UPLOADED',
        },
      });

      return res.json({ success: true, message: 'Document uploaded', data: doc });
    } catch (err: any) {
      console.error('Upload error:', err);
      return res.status(500).json({ success: false, message: 'Upload failed' });
    }
  }

  /**
   * List applications for Coordinator or Admin
   */
  public static async listQueue(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

      const whereClause: any = {};

      if (user.role === Role.COORDINATOR) {
        // Scoped to coordinator's university
        if (user.universityId) {
          whereClause.universityId = user.universityId;
        }
      }

      const { status, search } = req.query;
      if (status && status !== 'ALL') {
        whereClause.status = status as string;
      }

      if (search) {
        whereClause.OR = [
          { applicationNo: { contains: search as string } },
          { rollNumber: { contains: search as string } },
          { student: { fullName: { contains: search as string } } },
          { student: { cnic: { contains: search as string } } },
        ];
      }

      const applications = await prisma.application.findMany({
        where: whereClause,
        include: {
          student: { select: { fullName: true, cnic: true, mobile: true, email: true } },
          university: true,
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: applications });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Coordinator verification (Approve)
   */
  public static async verifyByCoordinator(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      const { id } = req.params;

      const app = await prisma.application.findUnique({
        where: { id },
        include: { student: true, university: true },
      });

      if (!app) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      const updated = await prisma.application.update({
        where: { id },
        data: {
          status: ApplicationStatus.VERIFIED,
          verifiedAt: new Date(),
          verifiedById: user?.id,
          rejectionReason: null,
          rejectionRemarks: null,
        },
      });

      await auditService.log({
        entity: 'Application',
        entityId: id,
        action: 'VERIFIED',
        performedBy: user?.email || 'coordinator',
        details: { coordinator: user?.fullName, university: app.university.name },
      });

      await prisma.notification.create({
        data: {
          userId: app.studentId,
          title: 'Institutional Verification Approved',
          message: `Your university (${app.university.name}) has verified your regular enrollment and academic standing. Your application is now in the upcoming lottery selection pool!`,
          type: 'SUCCESS',
        },
      });

      return res.json({ success: true, message: 'Application successfully verified', data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Coordinator rejection (Reject with mandatory remarks)
   */
  public static async rejectByCoordinator(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      const { id } = req.params;
      const { rejectionReason, remarks } = req.body;

      if (!remarks || remarks.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Mandatory rejection remarks must be provided (minimum 5 characters).',
        });
      }

      const app = await prisma.application.findUnique({ where: { id } });
      if (!app) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      const updated = await prisma.application.update({
        where: { id },
        data: {
          status: ApplicationStatus.REJECTED,
          rejectionReason: rejectionReason || 'COORDINATOR_DISQUALIFIED',
          rejectionRemarks: remarks,
          verifiedAt: new Date(),
          verifiedById: user?.id,
        },
      });

      await auditService.log({
        entity: 'Application',
        entityId: id,
        action: 'REJECTED',
        performedBy: user?.email || 'coordinator',
        details: { remarks, rejectionReason },
      });

      await prisma.notification.create({
        data: {
          userId: app.studentId,
          title: 'Application Verification Update',
          message: `Your application has not been approved by your institution coordinator. Reason: ${remarks}`,
          type: 'WARNING',
        },
      });

      return res.json({ success: true, message: 'Application rejected', data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
