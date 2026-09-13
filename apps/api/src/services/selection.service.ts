import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export interface SelectionParams {
  mode?: 'FCFS' | 'MERIT_SCORE' | 'LOTTERY';
  quota?: number;
  executedBy: string;
}

export interface DrawSummary {
  drawId: string;
  mode: string;
  executedAt: string;
  totalEligible: number;
  totalSelected: number;
  resultsLog: Array<{
    applicationNo: string;
    maskedName: string;
    maskedCnic: string;
    universityName: string;
    selectionRank: number;
    score?: number;
  }>;
}

export class SelectionEngineService {
  constructor(private prisma: PrismaClient) {}

  public async executeSelection(params: SelectionParams): Promise<DrawSummary> {
    const config = await this.prisma.schemeConfig.findUnique({
      where: { id: 'default-config' },
    });

    const mode = params.mode || config?.selectionMode || 'LOTTERY';
    const quota = params.quota || 50;

    // Fetch all verified applications that are awaiting selection
    const verifiedApps = await this.prisma.application.findMany({
      where: {
        status: 'VERIFIED',
      },
      include: {
        student: true,
        university: true,
      },
    });

    if (verifiedApps.length === 0) {
      throw new Error('No verified applications available in the candidate pool to select.');
    }

    let orderedApps = [...verifiedApps];

    if (mode === 'FCFS') {
      // First-come first-served based on creation timestamp
      orderedApps.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    } else if (mode === 'MERIT_SCORE') {
      // Weighted scoring:
      // CGPA (40%) + Attendance (30%) + Low-Income Weight (20%) + Differently-abled (10%)
      const scoreMap = new Map<string, number>();
      for (const app of orderedApps) {
        const cgpaScore = ((app.cgpa || 2.5) / 4.0) * 40;
        const attScore = (app.attendanceRate / 100) * 30;
        const incomeScore = app.householdMonthlyIncome <= 50000 ? 20 : app.householdMonthlyIncome <= 80000 ? 10 : 5;
        const disabilityScore = app.isDifferentlyAbled ? 10 : 0;
        const total = cgpaScore + attScore + incomeScore + disabilityScore;
        scoreMap.set(app.id, total);
      }
      orderedApps.sort((a, b) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0));
    } else {
      // Cryptographically fair randomized shuffle (Fisher-Yates)
      for (let i = orderedApps.length - 1; i > 0; i--) {
        const randomBuffer = crypto.randomBytes(4);
        const j = randomBuffer.readUInt32BE(0) % (i + 1);
        [orderedApps[i], orderedApps[j]] = [orderedApps[j], orderedApps[i]];
      }
    }

    const selectedSlice = orderedApps.slice(0, quota);
    const drawId = `DRAW-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    const resultsLog = selectedSlice.map((app, index) => {
      const nameParts = app.student.fullName.split(' ');
      const maskedName = nameParts.map((p) => (p.length > 2 ? `${p[0]}***` : p)).join(' ');
      const cnicParts = app.student.cnic.split('-');
      const maskedCnic = cnicParts.length === 3 ? `${cnicParts[0]}-*******-${cnicParts[2]}` : app.student.cnic;

      return {
        applicationNo: app.applicationNo,
        maskedName,
        maskedCnic,
        universityName: app.university.name,
        selectionRank: index + 1,
      };
    });

    // Update applications to SELECTED and assign default allocation token
    for (const app of selectedSlice) {
      const qrToken = `EBS-TOKEN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
      await this.prisma.application.update({
        where: { id: app.id },
        data: {
          status: 'SELECTED',
          selectedAt: new Date(),
          lotteryDrawId: drawId,
        },
      });

      // Auto-assign nearest OEM center (based on city)
      const centerCity = app.university.city;
      await this.prisma.bikeAllocation.upsert({
        where: { applicationId: app.id },
        update: {},
        create: {
          applicationId: app.id,
          centerName: `Metro E-Bikes Authorized Center (${centerCity})`,
          bikeModel: 'Punjab Green E-Glide 1000 (Lithium-ion 72V)',
          qrCodeToken: qrToken,
          status: 'ALLOCATED',
        },
      });

      // Send in-app notification
      await this.prisma.notification.create({
        data: {
          userId: app.studentId,
          title: '🎉 Congratulations! You have been Selected for an E-Bike',
          message: `Your application (${app.applicationNo}) has been successfully selected in the official government draw. Your bike has been reserved at Metro E-Bikes Authorized Center (${centerCity}). Scan your QR token at pickup.`,
          type: 'SUCCESS',
        },
      });
    }

    // Persist immutable LotteryDraw record
    await this.prisma.lotteryDraw.create({
      data: {
        id: drawId,
        mode,
        totalSelected: selectedSlice.length,
        executedBy: params.executedBy,
        anonymizedResultsJson: JSON.stringify(resultsLog),
      },
    });

    return {
      drawId,
      mode,
      executedAt: new Date().toISOString(),
      totalEligible: verifiedApps.length,
      totalSelected: selectedSlice.length,
      resultsLog,
    };
  }
}
