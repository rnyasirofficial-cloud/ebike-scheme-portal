import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterStudentSchema, LoginSchema, Role } from '@ebike/shared';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'ebike_punjab_gov_jwt_secret_key_2026_super_secure';

// Mock OTP storage for dev
const OTP_STORE = new Map<string, string>();

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const parsed = RegisterStudentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.errors[0]?.message || 'Validation failed',
          errors: parsed.error.errors,
        });
      }

      const { fullName, cnic, mobile, email, password } = parsed.data;

      // Check for existing user
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ cnic }, { email }, { mobile }],
        },
      });

      if (existing) {
        let field = 'CNIC';
        if (existing.email === email) field = 'Email';
        if (existing.mobile === mobile) field = 'Mobile Number';
        return res.status(409).json({
          success: false,
          message: `An applicant account with this ${field} already exists.`,
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      OTP_STORE.set(mobile, otp);

      console.log(`\n========================================`);
      console.log(`[SMS OTP GATEWAY STUB] To: ${mobile} | Code: ${otp}`);
      console.log(`========================================\n`);

      const user = await prisma.user.create({
        data: {
          fullName,
          cnic,
          mobile,
          email,
          passwordHash,
          role: Role.STUDENT,
          isVerified: false,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Registration initiated. Please verify mobile OTP.',
        data: {
          userId: user.id,
          mobile: user.mobile,
          devMockOtp: otp, // Returned for dev convenience
        },
      });
    } catch (err: any) {
      console.error('Register error:', err);
      return res.status(500).json({ success: false, message: 'Server error during registration' });
    }
  }

  public static async verifyOtp(req: Request, res: Response) {
    try {
      const { mobile, otp } = req.body;
      const storedOtp = OTP_STORE.get(mobile);

      // In development, accept stored OTP or default '123456'
      if (otp !== storedOtp && otp !== '123456') {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      const user = await prisma.user.update({
        where: { mobile },
        data: { isVerified: true },
      });

      OTP_STORE.delete(mobile);

      const token = jwt.sign(
        {
          id: user.id,
          cnic: user.cnic,
          email: user.email,
          role: user.role,
          universityId: user.universityId,
          fullName: user.fullName,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Mobile verified successfully',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          cnic: user.cnic,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
        },
      });
    } catch (err: any) {
      console.error('OTP error:', err);
      return res.status(500).json({ success: false, message: 'OTP verification failed' });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid credentials provided' });
      }

      const { identifier, password } = parsed.data;

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ cnic: identifier }, { email: identifier }],
        },
        include: {
          university: true,
        },
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid CNIC/Email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid CNIC/Email or password' });
      }

      const token = jwt.sign(
        {
          id: user.id,
          cnic: user.cnic,
          email: user.email,
          role: user.role,
          universityId: user.universityId,
          fullName: user.fullName,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          cnic: user.cnic,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          universityId: user.universityId,
          university: user.university,
        },
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, message: 'Server error during login' });
    }
  }

  public static async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthenticated' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { university: true },
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          fullName: user.fullName,
          cnic: user.cnic,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          universityId: user.universityId,
          university: user.university,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
    }
  }
}
