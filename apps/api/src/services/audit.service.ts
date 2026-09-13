import { PrismaClient } from '@prisma/client';

export class AuditService {
  constructor(private prisma: PrismaClient) {}

  public async log(params: {
    entity: string;
    entityId: string;
    action: string;
    performedBy: string;
    details?: any;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          entity: params.entity,
          entityId: params.entityId,
          action: params.action,
          performedBy: params.performedBy,
          detailsJson: params.details ? JSON.stringify(params.details) : null,
        },
      });
    } catch (err) {
      console.error('Audit log failed:', err);
    }
  }
}
