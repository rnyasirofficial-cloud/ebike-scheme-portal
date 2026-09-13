import { Router } from 'express';
import multer from 'multer';
import { AuthController } from '../controllers/auth.controller';
import { ApplicationController } from '../controllers/application.controller';
import { UniversityController } from '../controllers/university.controller';
import { SelectionController } from '../controllers/selection.controller';
import { DealerController } from '../controllers/dealer.controller';
import { TicketController } from '../controllers/ticket.controller';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { Role } from '@ebike/shared';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', AuthController.register);
router.post('/auth/verify-otp', AuthController.verifyOtp);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticateToken, AuthController.me);

// --- Application Routes ---
router.post('/applications/pre-check', authenticateToken, ApplicationController.preCheckEligibility);
router.post('/applications/submit', authenticateToken, ApplicationController.submit);
router.get('/applications/my-app', authenticateToken, ApplicationController.getMyApplication);
router.post('/applications/upload-document', authenticateToken, upload.single('file'), ApplicationController.uploadDocument);
router.get(
  '/applications/queue',
  authenticateToken,
  requireRole(Role.COORDINATOR, Role.ADMIN),
  ApplicationController.listQueue
);
router.post(
  '/applications/:id/verify',
  authenticateToken,
  requireRole(Role.COORDINATOR, Role.ADMIN),
  ApplicationController.verifyByCoordinator
);
router.post(
  '/applications/:id/reject',
  authenticateToken,
  requireRole(Role.COORDINATOR, Role.ADMIN),
  ApplicationController.rejectByCoordinator
);

// --- University Routes ---
router.get('/universities', UniversityController.list);
router.post('/universities/sync', authenticateToken, requireRole(Role.ADMIN), UniversityController.syncFromHec);
router.post('/universities/upload-csv', authenticateToken, requireRole(Role.ADMIN), upload.single('file'), UniversityController.uploadCsv);

// --- Selection & Admin Analytics ---
router.post('/selection/run', authenticateToken, requireRole(Role.ADMIN), SelectionController.executeDraw);
router.get('/selection/draws', SelectionController.getDraws);
router.get('/selection/analytics', SelectionController.getAnalytics);
router.get('/selection/config', SelectionController.getConfig);
router.put('/selection/config', authenticateToken, requireRole(Role.ADMIN), SelectionController.updateConfig);

// --- Dealer / OEM Handover ---
router.get('/dealer/dashboard', authenticateToken, requireRole(Role.DEALER, Role.ADMIN), DealerController.getDashboard);
router.post('/dealer/confirm-handover', authenticateToken, requireRole(Role.DEALER, Role.ADMIN), DealerController.confirmHandover);

// --- Support Tickets ---
router.post('/tickets', authenticateToken, TicketController.create);
router.get('/tickets', authenticateToken, TicketController.list);
router.post('/tickets/:id/reply', authenticateToken, requireRole(Role.ADMIN, Role.COORDINATOR), TicketController.reply);

// --- Notifications ---
router.get('/notifications', authenticateToken, NotificationController.list);
router.put('/notifications/:id/read', authenticateToken, NotificationController.markAsRead);

// --- Database Management & Registry Engine ---
import { DatabaseController } from '../controllers/database.controller';
router.get('/database/status', DatabaseController.getStatus);
router.get('/database/tables/:tableName', DatabaseController.getTableRecords);
router.get('/database/export', DatabaseController.exportBackup);

export default router;
