import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export class NotificationController {
  public static async list(req: AuthenticatedRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Unauthenticated' });

      const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: notifications });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      await prisma.notification.updateMany({
        where: { id, userId: user?.id },
        data: { read: true },
      });

      return res.json({ success: true, message: 'Notification marked as read' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
