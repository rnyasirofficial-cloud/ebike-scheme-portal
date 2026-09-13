import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import apiRoutes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static documents / uploads
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Mount main API
app.use('/api', apiRoutes);

// Root and API Overview handlers
app.get('/', (req, res) => {
  res.json({
    status: 'UP',
    name: 'Punjab E-Bike Scheme REST API',
    endpoints: {
      health: '/api/health',
      universities: '/api/universities',
      analytics: '/api/selection/analytics',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        verifyOtp: 'POST /api/auth/verify-otp',
      },
    },
    webPortal: 'http://localhost:3000',
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'UP',
    message: 'Punjab E-Bike Scheme REST API Gateway',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      universities: 'GET /api/universities',
      analytics: 'GET /api/selection/analytics',
      draws: 'GET /api/selection/draws',
      dealerDashboard: 'GET /api/dealer/dashboard',
      myApplication: 'GET /api/applications/my-app',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    name: 'Punjab E-Bike Scheme REST API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🏍️  Punjab E-Bike Scheme API Server running on port ${PORT}`);
    console.log(`🌐 Health endpoint: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

export default app;
