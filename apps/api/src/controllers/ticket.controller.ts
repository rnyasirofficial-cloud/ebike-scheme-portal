import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export class TicketController {
  public static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

      const { subject, message, priority, applicationId } = req.body;
      if (!subject || !message) {
        return res.status(400).json({ success: false, message: 'Subject and message are required' });
      }

      const ticket = await prisma.supportTicket.create({
        data: {
          userId: user.id,
          applicationId,
          subject,
          message,
          priority: priority || 'NORMAL',
          status: 'OPEN',
        },
      });

      return res.status(201).json({ success: true, message: 'Support ticket submitted', data: ticket });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async list(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

      const whereClause = user.role === 'STUDENT' ? { userId: user.id } : {};
      const tickets = await prisma.supportTicket.findMany({
        where: whereClause,
        include: { user: { select: { fullName: true, cnic: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: tickets });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async reply(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { response, status } = req.body;

      const ticket = await prisma.supportTicket.update({
        where: { id },
        data: {
          response,
          status: status || 'RESOLVED',
          resolvedAt: new Date(),
        },
      });

      return res.json({ success: true, message: 'Response recorded', data: ticket });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
