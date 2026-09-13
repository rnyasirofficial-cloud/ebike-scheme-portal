// -- SOURCE: HEC-affiliated directory, verify/refresh against hec.gov.pk before production launch
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PUNJAB_HEC_UNIVERSITIES = [
  // Public Sector (1-30)
  { name: 'University of the Punjab', city: 'Lahore', sector: 'Public' },
  { name: 'Government College University', city: 'Lahore', sector: 'Public' },
  { name: 'Government College University', city: 'Faisalabad', sector: 'Public' },
  { name: 'Government College Women University', city: 'Faisalabad', sector: 'Public' },
  { name: 'Government College Women University', city: 'Sialkot', sector: 'Public' },
  { name: 'University of Engineering & Technology', city: 'Lahore', sector: 'Public' },
  { name: 'Bahauddin Zakariya University', city: 'Multan', sector: 'Public' },
  { name: 'University of Agriculture', city: 'Faisalabad', sector: 'Public' },
  { name: 'University of Sargodha', city: 'Sargodha', sector: 'Public' },
  { name: 'University of Gujrat', city: 'Gujrat', sector: 'Public' },
  { name: 'University of Education', city: 'Lahore', sector: 'Public' },
  { name: 'University of Health Sciences', city: 'Lahore', sector: 'Public' },
  { name: 'University of Veterinary & Animal Sciences', city: 'Lahore', sector: 'Public' },
  { name: 'Fatima Jinnah Medical University', city: 'Lahore', sector: 'Public' },
  { name: 'Fatima Jinnah Women University', city: 'Rawalpindi', sector: 'Public' },
  { name: 'King Edward Medical University', city: 'Lahore', sector: 'Public' },
  { name: 'Lahore College for Women University', city: 'Lahore', sector: 'Public' },
  { name: 'National College of Arts', city: 'Lahore', sector: 'Public' },
  { name: 'National Textile University', city: 'Faisalabad', sector: 'Public' },
  { name: 'Information Technology University', city: 'Lahore', sector: 'Public' },
  { name: 'Virtual University of Pakistan', city: 'Lahore', sector: 'Public' },
  { name: 'Ghazi University', city: 'D.G. Khan', sector: 'Public' },
  { name: 'Khawaja Fareed University of Engineering & IT', city: 'Rahim Yar Khan', sector: 'Public' },
  { name: 'NFC Institute of Engineering & Technology', city: 'Multan', sector: 'Public' },
  { name: 'Muhammad Nawaz Sharif University of Agriculture', city: 'Multan', sector: 'Public' },
  { name: 'Muhammad Nawaz Sharif University of Engineering & Technology', city: 'Multan', sector: 'Public' },
  { name: 'Pir Mehr Ali Shah Arid Agriculture University', city: 'Rawalpindi', sector: 'Public' },
  { name: 'The Women University', city: 'Multan', sector: 'Public' },
  { name: 'Pakistan Institute of Fashion Design', city: 'Lahore', sector: 'Public' },
  { name: 'National University of Medical Sciences', city: 'Rawalpindi', sector: 'Public' },

  // Private Sector (31-52)
  { name: 'Lahore University of Management Sciences (LUMS)', city: 'Lahore', sector: 'Private' },
  { name: 'University of Management and Technology (UMT)', city: 'Lahore', sector: 'Private' },
  { name: 'University of Central Punjab', city: 'Lahore', sector: 'Private' },
  { name: 'University of South Asia', city: 'Lahore', sector: 'Private' },
  { name: 'University of Lahore', city: 'Lahore', sector: 'Private' },
  { name: 'The University of Faisalabad', city: 'Faisalabad', sector: 'Private' },
  { name: 'Superior University', city: 'Lahore', sector: 'Private' },
  { name: 'Forman Christian College (Chartered University)', city: 'Lahore', sector: 'Private' },
  { name: 'Beaconhouse National University', city: 'Lahore', sector: 'Private' },
  { name: 'Kinnaird College for Women (Chartered University)', city: 'Lahore', sector: 'Private' },
  { name: 'Institute of Management Sciences', city: 'Lahore', sector: 'Private' },
  { name: 'Institute of Southern Punjab', city: 'Multan', sector: 'Private' },
  { name: 'Lahore Garrison University', city: 'Lahore', sector: 'Private' },
  { name: 'Lahore Leads University', city: 'Lahore', sector: 'Private' },
  { name: 'Lahore School of Economics', city: 'Lahore', sector: 'Private' },
  { name: 'Minhaj University', city: 'Lahore', sector: 'Private' },
  { name: 'National College of Business Administration & Economics', city: 'Lahore', sector: 'Private' },
  { name: 'Nur International University', city: 'Lahore', sector: 'Private' },
  { name: 'Qarshi University', city: 'Lahore', sector: 'Private' },
  { name: 'GIFT University', city: 'Gujranwala', sector: 'Private' },
  { name: 'Hajvery University', city: 'Lahore', sector: 'Private' },
  { name: 'Green International University', city: 'Lahore', sector: 'Private' },
];

async function main() {
  console.log('Seeding HEC-Recognized Universities for Punjab...');

  const createdUniversities: Record<string, string> = {};

  for (let i = 0; i < PUNJAB_HEC_UNIVERSITIES.length; i++) {
    const u = PUNJAB_HEC_UNIVERSITIES[i];
    const uniqueKey = `${u.name} — ${u.city}`;
    const record = await prisma.university.upsert({
      where: { name: uniqueKey },
      update: {
        city: u.city,
        sector: u.sector,
        province: 'Punjab',
        hecRecognized: true,
        hecReferenceNo: `HEC-PB-${(i + 1).toString().padStart(4, '0')}`,
        isActive: true,
      },
      create: {
        name: uniqueKey,
        city: u.city,
        sector: u.sector,
        province: 'Punjab',
        hecRecognized: true,
        hecReferenceNo: `HEC-PB-${(i + 1).toString().padStart(4, '0')}`,
        isActive: true,
      },
    });
    createdUniversities[uniqueKey] = record.id;
  }

  console.log(`Seeded ${PUNJAB_HEC_UNIVERSITIES.length} universities.`);

  // Scheme Config
  await prisma.schemeConfig.upsert({
    where: { id: 'default-config' },
    update: {},
    create: {
      id: 'default-config',
      selectionMode: 'LOTTERY',
      subsidyPercentage: 50.0,
      maxQuota: 10000,
      installmentMonths: 24,
      monthlyInstallment: 4500,
      isActive: true,
    },
  });

  const puId = Object.entries(createdUniversities).find(([k]) => k.includes('University of the Punjab'))?.[1] || Object.values(createdUniversities)[0];

  const defaultPasswordHash = await bcrypt.hash('DemoPass123!', 10);
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const dealerPasswordHash = await bcrypt.hash('DealerPass123!', 10);

  // 1. Demo Student
  const demoStudent = await prisma.user.upsert({
    where: { cnic: '35201-1234567-1' },
    update: {},
    create: {
      cnic: '35201-1234567-1',
      fullName: 'Ali Raza',
      email: 'student@punjab.gov.pk',
      mobile: '03001234567',
      role: 'STUDENT',
      passwordHash: defaultPasswordHash,
      isVerified: true,
      universityId: puId,
    },
  });

  // 2. Demo Coordinator
  await prisma.user.upsert({
    where: { cnic: '35201-9876543-1' },
    update: {},
    create: {
      cnic: '35201-9876543-1',
      fullName: 'Prof. Dr. Tariq Mahmood',
      email: 'coordinator@pu.edu.pk',
      mobile: '03007654321',
      role: 'COORDINATOR',
      passwordHash: defaultPasswordHash,
      isVerified: true,
      universityId: puId,
    },
  });

  // 3. Demo Admin
  await prisma.user.upsert({
    where: { cnic: '35202-0000001-1' },
    update: {},
    create: {
      cnic: '35202-0000001-1',
      fullName: 'Muhammad Usman (Director Transport)',
      email: 'admin@transport.punjab.gov.pk',
      mobile: '03000000001',
      role: 'ADMIN',
      passwordHash: adminPasswordHash,
      isVerified: true,
    },
  });

  // 4. Demo Dealer
  const demoDealer = await prisma.user.upsert({
    where: { cnic: '35202-0000002-2' },
    update: {},
    create: {
      cnic: '35202-0000002-2',
      fullName: 'Metro E-Bikes Center Lahore',
      email: 'dealer@honda-ebikes.pk',
      mobile: '03000000002',
      role: 'DEALER',
      passwordHash: dealerPasswordHash,
      isVerified: true,
    },
  });

  // Create demo application for Ali Raza
  const existingApp = await prisma.application.findUnique({
    where: { applicationNo: 'EBS-2026-000142' },
  });

  if (!existingApp) {
    const app = await prisma.application.create({
      data: {
        applicationNo: 'EBS-2026-000142',
        studentId: demoStudent.id,
        universityId: puId,
        dob: '2003-05-14',
        gender: 'MALE',
        fatherName: 'Muhammad Raza',
        address: 'House #45-B, Sector D, Valencia Town, Lahore',
        domicileDistrict: 'Lahore',
        licenseNumber: 'LHR-LRN-2024-8921',
        licenseType: 'LEARNER',
        licenseExpiry: '2026-11-20',
        degreeProgram: 'BS Computer Science',
        rollNumber: 'BSCS-2023-114',
        currentSemester: 4,
        cgpa: 3.68,
        attendanceRate: 88.5,
        isRegularStudent: true,
        hasProbation: false,
        bankIban: 'PK36BAHL0001234567890123',
        walletType: 'BANK_ACCOUNT',
        walletNumber: '03001234567',
        householdMonthlyIncome: 65000,
        isDifferentlyAbled: false,
        signatureName: 'Ali Raza',
        status: 'VERIFIED',
      },
    });

    // Add documents
    await prisma.document.createMany({
      data: [
        { applicationId: app.id, docType: 'CNIC_FRONT', originalName: 'cnic_front.jpg', filePath: '/uploads/cnic_front.jpg', mimeType: 'image/jpeg', size: 124000, status: 'VERIFIED' },
        { applicationId: app.id, docType: 'CNIC_BACK', originalName: 'cnic_back.jpg', filePath: '/uploads/cnic_back.jpg', mimeType: 'image/jpeg', size: 118000, status: 'VERIFIED' },
        { applicationId: app.id, docType: 'DOMICILE', originalName: 'domicile_lahore.pdf', filePath: '/uploads/domicile_lahore.pdf', mimeType: 'application/pdf', size: 340000, status: 'VERIFIED' },
        { applicationId: app.id, docType: 'LICENSE', originalName: 'learner_permit.jpg', filePath: '/uploads/learner_permit.jpg', mimeType: 'image/jpeg', size: 156000, status: 'VERIFIED' },
        { applicationId: app.id, docType: 'STUDENT_CARD', originalName: 'pu_student_card.jpg', filePath: '/uploads/pu_student_card.jpg', mimeType: 'image/jpeg', size: 210000, status: 'VERIFIED' },
      ],
    });

    // Add sample installments
    const dueDates = [
      new Date('2026-10-01'),
      new Date('2026-11-01'),
      new Date('2026-12-01'),
      new Date('2027-01-01'),
    ];
    for (let j = 0; j < dueDates.length; j++) {
      await prisma.payment.create({
        data: {
          applicationId: app.id,
          amount: 4500,
          installmentNumber: j + 1,
          dueDate: dueDates[j],
          status: j === 0 ? 'PENDING' : 'PENDING',
        },
      });
    }

    // Add notification
    await prisma.notification.create({
      data: {
        userId: demoStudent.id,
        title: 'Institutional Verification Complete',
        message: 'Your enrollment and academic standing at University of the Punjab have been verified by Prof. Dr. Tariq Mahmood. Your application is now in the upcoming lottery draw pool.',
        type: 'SUCCESS',
      },
    });
  }

  // Create another pending application for coordinator testing
  const secondStudent = await prisma.user.upsert({
    where: { cnic: '35202-5432198-2' },
    update: {},
    create: {
      cnic: '35202-5432198-2',
      fullName: 'Ayesha Khan',
      email: 'ayesha.khan@student.pk',
      mobile: '03019876543',
      role: 'STUDENT',
      passwordHash: defaultPasswordHash,
      isVerified: true,
      universityId: puId,
    },
  });

  const pendingApp = await prisma.application.findUnique({
    where: { applicationNo: 'EBS-2026-000143' },
  });

  if (!pendingApp) {
    const pApp = await prisma.application.create({
      data: {
        applicationNo: 'EBS-2026-000143',
        studentId: secondStudent.id,
        universityId: puId,
        dob: '2004-02-10',
        gender: 'FEMALE',
        fatherName: 'Imran Khan',
        address: 'House #12, Canal View, Lahore',
        domicileDistrict: 'Lahore',
        licenseNumber: 'LHR-DL-2023-4512',
        licenseType: 'PERMANENT',
        licenseExpiry: '2028-04-15',
        degreeProgram: 'BS Information Technology',
        rollNumber: 'BSIT-2023-045',
        currentSemester: 3,
        cgpa: 3.82,
        attendanceRate: 91.0,
        isRegularStudent: true,
        hasProbation: false,
        bankIban: 'PK45HABB0009876543210987',
        walletType: 'JAZZCASH',
        walletNumber: '03019876543',
        householdMonthlyIncome: 55000,
        isDifferentlyAbled: false,
        signatureName: 'Ayesha Khan',
        status: 'SUBMITTED',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago -> triggers SLA badge!
      },
    });

    await prisma.document.createMany({
      data: [
        { applicationId: pApp.id, docType: 'CNIC_FRONT', originalName: 'ayesha_cnic.jpg', filePath: '/uploads/ayesha_cnic.jpg', mimeType: 'image/jpeg', size: 145000, status: 'UPLOADED' },
        { applicationId: pApp.id, docType: 'DOMICILE', originalName: 'domicile.pdf', filePath: '/uploads/domicile.pdf', mimeType: 'application/pdf', size: 280000, status: 'UPLOADED' },
        { applicationId: pApp.id, docType: 'LICENSE', originalName: 'license.jpg', filePath: '/uploads/license.jpg', mimeType: 'image/jpeg', size: 172000, status: 'UPLOADED' },
        { applicationId: pApp.id, docType: 'STUDENT_CARD', originalName: 'student_card.jpg', filePath: '/uploads/student_card.jpg', mimeType: 'image/jpeg', size: 198000, status: 'UPLOADED' },
      ],
    });
  }

  // 5. Seed Dealership Pickup Centers across Punjab
  console.log('Seeding Dealership Centers...');
  const dealerships = [
    { name: 'Metro E-Bikes Center Lahore', city: 'Lahore', address: 'Plot 14-B, Main Boulevard, Gulberg III, Lahore', contactPerson: 'Malik Zeeshan', phone: '042-35789012', email: 'lahore@metroebikes.pk', quota: 3500 },
    { name: 'Apex Electric Hub Rawalpindi', city: 'Rawalpindi', address: 'Shop 8-10, Civic Center, Bahria Phase 4, Rawalpindi', contactPerson: 'Raja Faheem', phone: '051-5490123', email: 'pindi@apexelectric.pk', quota: 2000 },
    { name: 'Green Mobility Depot Multan', city: 'Multan', address: 'Bosan Road near Chungi No. 9, Multan', contactPerson: 'Chaudhry Nadeem', phone: '061-6223344', email: 'multan@greenmobility.pk', quota: 1500 },
    { name: 'Pak-Hero EV Showroom Faisalabad', city: 'Faisalabad', address: 'D-Ground Commercial Zone, Faisalabad', contactPerson: 'Mian Asad', phone: '041-8712345', email: 'faisalabad@pakhero.pk', quota: 1800 },
    { name: 'EcoRider Center Gujranwala', city: 'Gujranwala', address: 'GT Road near Model Town, Gujranwala', contactPerson: 'Sheikh Farrukh', phone: '055-4298765', email: 'gujranwala@ecorider.pk', quota: 1200 },
  ];

  for (const d of dealerships) {
    await prisma.dealershipCenter.upsert({
      where: { name: d.name },
      update: d,
      create: d,
    });
  }

  // 6. Seed Electric Bike Models
  console.log('Seeding Bike Models...');
  const bikeModels = [
    {
      name: 'Punjab E-Glide 1000 Series',
      brand: 'Apex Electrics',
      batteryType: 'Lithium-Ion 72V 35Ah',
      rangeKm: 85,
      topSpeedKmh: 65,
      warrantyYears: 3,
      retailPrice: 216000,
      govtGrant: 108000,
      studentShare: 108000,
      inStock: 5000,
      imageUrl: '/ebike-hero.jpg',
    },
    {
      name: 'Roadmaster Green Cruiser 70',
      brand: 'Roadmaster EV',
      batteryType: 'Lithium-Ion 60V 30Ah',
      rangeKm: 75,
      topSpeedKmh: 60,
      warrantyYears: 3,
      retailPrice: 195000,
      govtGrant: 97500,
      studentShare: 97500,
      inStock: 3000,
      imageUrl: '/ebike-hero.jpg',
    },
    {
      name: 'Super Star Eco-Rider 1500',
      brand: 'Super Star Motors',
      batteryType: 'Lithium-Ion 72V 42Ah',
      rangeKm: 95,
      topSpeedKmh: 70,
      warrantyYears: 3,
      retailPrice: 235000,
      govtGrant: 117500,
      studentShare: 117500,
      inStock: 2000,
      imageUrl: '/ebike-hero.jpg',
    },
  ];

  for (const b of bikeModels) {
    await prisma.bikeModel.upsert({
      where: { name: b.name },
      update: b,
      create: b,
    });
  }

  // 7. Seed Sample Allocated Application for Student Ali Raza
  if (existingApp || demoStudent) {
    const studentApp = existingApp || await prisma.application.findFirst({ where: { studentId: demoStudent.id } });
    if (studentApp) {
      // Create bike allocation
      await prisma.bikeAllocation.upsert({
        where: { applicationId: studentApp.id },
        update: {},
        create: {
          applicationId: studentApp.id,
          dealerId: demoDealer.id,
          centerName: 'Metro E-Bikes Center Lahore — Gulberg III',
          bikeModel: 'Punjab E-Glide 1000 Series',
          frameNumber: 'PB-EV-2026-FR89012',
          batterySerialNumber: 'BAT-LIT-72V-882190',
          registrationNumber: 'LEG-2026-0814',
          qrCodeToken: `QR-EBIKE-PB-${studentApp.applicationNo}`,
          status: 'ALLOCATED',
          remarks: 'Approved in 2026 Phase-I Balloting. Ready for physical pickup voucher verification.',
        },
      });

      // Mark first installment as PAID
      const firstPayment = await prisma.payment.findFirst({
        where: { applicationId: studentApp.id, installmentNumber: 1 },
      });
      if (firstPayment) {
        await prisma.payment.update({
          where: { id: firstPayment.id },
          data: {
            status: 'PAID',
            paidDate: new Date(),
            transactionRef: '1LINK-FT-2026-9912048',
          },
        });
      }
    }
  }

  // 8. Seed Registry Logs (simulated NADRA, Excise, HEC verifications)
  console.log('Seeding External Verification Registry Logs...');
  await prisma.registryLog.createMany({
    data: [
      {
        registryName: 'NADRA',
        identifier: '35201-1234567-1',
        isVerified: true,
        rawResponse: JSON.stringify({ verisysId: 'VER-8821-OK', citizenName: 'Ali Raza', fatherName: 'Muhammad Raza', dob: '2003-05-14', province: 'Punjab', status: 'VALID' }),
      },
      {
        registryName: 'EXCISE_TAXATION',
        identifier: 'LHR-LRN-2024-8921',
        isVerified: true,
        rawResponse: JSON.stringify({ licenseNo: 'LHR-LRN-2024-8921', category: 'MOTORCYCLE', type: 'LEARNER', expiry: '2026-11-20', status: 'ACTIVE' }),
      },
      {
        registryName: 'HEC_PAKISTAN',
        identifier: 'BSCS-2023-114',
        isVerified: true,
        rawResponse: JSON.stringify({ institution: 'University of the Punjab', rollNumber: 'BSCS-2023-114', cgpa: 3.68, attendance: '88.5%', regularStudent: true }),
      },
      {
        registryName: 'DOMICILE_PORTAL',
        identifier: 'DOM-LHR-2023-9081',
        isVerified: true,
        rawResponse: JSON.stringify({ district: 'Lahore', province: 'Punjab', verifiedDate: '2023-08-12' }),
      },
    ],
  });

  // 9. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { entity: 'APPLICATION', entityId: 'EBS-2026-000142', action: 'APPLICATION_SUBMITTED', performedBy: 'student@punjab.gov.pk', detailsJson: 'Submitted initial application' },
      { entity: 'APPLICATION', entityId: 'EBS-2026-000142', action: 'APPLICATION_VERIFIED', performedBy: 'coordinator@pu.edu.pk', detailsJson: 'Attested attendance >= 75% and verified student enrollment' },
      { entity: 'LOTTERY_DRAW', entityId: 'DRAW-2026-PHASE1', action: 'BALLOTING_EXECUTED', performedBy: 'admin@transport.punjab.gov.pk', detailsJson: 'Automated cryptographic e-ballot draw executed' },
      { entity: 'BIKE_ALLOCATION', entityId: 'EBS-2026-000142', action: 'BIKE_ALLOCATED', performedBy: 'dealer@honda-ebikes.pk', detailsJson: 'Assigned Roadmaster E-Glide 1000 with Frame # PB-EV-2026-FR89012' },
    ],
  });

  console.log('All comprehensive databases seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
