import { PrismaClient } from '../lib/generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Roles ──────────────────────────────────────────────────────────────────
  const roleSuperadmin = await prisma.role.upsert({
    where: { name: 'SUPERADMIN' },
    update: {},
    create: { name: 'SUPERADMIN', description: 'Platform Owner / Super Administrator' },
  });

  const roleAdmin = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Company Admin / Manager' },
  });

  const roleClient = await prisma.role.upsert({
    where: { name: 'CLIENT' },
    update: {},
    create: { name: 'CLIENT', description: 'CRM Platform Client' },
  });

  await prisma.role.upsert({
    where: { name: 'EMPLOYEE' },
    update: {},
    create: { name: 'EMPLOYEE', description: 'Regular Employee' },
  });

  await prisma.role.upsert({
    where: { name: 'TEAMLEADER' },
    update: {},
    create: { name: 'TEAMLEADER', description: 'Team Leader / Supervisor' },
  });

  console.log('✅ Roles seeded');

  // ── Super Admin User ───────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'superadmin@gmail.com' },
    update: {},
    create: {
      email: 'superadmin@gmail.com',
      name: 'Super Admin',
      passwordHash: await bcrypt.hash('AdminPass123!', 12),
      roleId: roleSuperadmin.id,
      suspended: false,
      phone: '',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Super Admin user seeded — email: superadmin@gmail.com / pass: AdminPass123!');

  // ── Client Record ──────────────────────────────────────────────────────────
  const client = await prisma.client.upsert({
    where: { id: 'client-seed-1' },
    update: {},
    create: {
      id: 'client-seed-1',
      companyName: 'Septic & Drain Specialists',
      contactName: 'John Doe',
      contactEmail: 'client@gmail.com',
      contactPhone: '555-0188',
      plan: 'GROWTH',
      status: 'ACTIVE',
    },
  });

  // ── Client User ────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'client@gmail.com' },
    update: {},
    create: {
      email: 'client@gmail.com',
      name: 'John Doe',
      passwordHash: await bcrypt.hash('AdminPass123!', 12),
      roleId: roleClient.id,
      clientId: client.id,
      suspended: false,
      phone: '555-0188',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Client user seeded — email: client@gmail.com / pass: AdminPass123!');

  // ── Admin Record ───────────────────────────────────────────────────────────
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'Admin',
      phone: '555-0122',
      capacity: 1000,
      activeTasks: 2,
      completionRate: 92.4,
      status: 'AVAILABLE',
    },
  });

  // ── Admin User ─────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      name: 'Admin',
      passwordHash: await bcrypt.hash('AdminPass123!', 12),
      roleId: roleAdmin.id,
      adminId: admin.id,
      suspended: false,
      phone: '555-0122',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Admin user seeded — email: admin@gmail.com / pass: AdminPass123!');

  // ── Sample Project ─────────────────────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { id: 'proj-seed-1' },
    update: {},
    create: {
      id: 'proj-seed-1',
      name: 'Spring Leads Outreach',
      clientId: client.id,
      status: 'PENDING_APPROVAL',
      progress: 0,
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 'proj-seed-2' },
    update: {},
    create: {
      id: 'proj-seed-2',
      name: 'Cold Pipe Outbound 2026',
      clientId: client.id,
      status: 'IN_PROGRESS',
      progress: 50,
      adminId: admin.id,
      startDate: new Date(Date.now() - 86400000 * 2),
      estCompletion: new Date(Date.now() + 86400000 * 4),
    },
  });

  console.log('✅ Sample projects seeded');

  // ── Sample Leads ──────────────────────────────────────────────────────────
  const leadsData = [
    { name: 'Sarah Connor', company: 'Cyberdyne Systems', phone: '555-0199', email: 'sarah@skynet.com', notes: 'Interested in missed call recovery.', status: 'NEW' },
    { name: 'Kyle Reese', company: 'Resistance Security', phone: '555-0122', email: 'kyle@resistance.net', notes: 'Wants automated voice test dial.', status: 'FOLLOW_UP' },
    { name: 'Marcus Wright', company: 'Project Angel Inc', phone: '555-0187', email: 'marcus@angel.org', notes: 'Objection handled - call scheduled.', status: 'INTERESTED' },
    { name: 'Peter Silberman', company: 'County Hospital', phone: '555-0134', email: 'silberman@hospital.org', notes: 'No answer, retry tomorrow.', status: 'NO_ANSWER' },
  ];

  for (const lead of leadsData) {
    await prisma.lead.create({
      data: {
        ...lead,
        projectId: project2.id,
        clientId: client.id,
      },
    }).catch(() => {}); // Skip duplicates
  }

  console.log('✅ Sample leads seeded');

  // ── Uploaded Files ────────────────────────────────────────────────────────
  await prisma.uploadedFile.upsert({
    where: { id: 'file-seed-1' },
    update: {},
    create: {
      id: 'file-seed-1',
      fileName: 'leads_500.csv',
      fileType: 'CSV',
      recordCount: 500,
      status: 'PENDING_APPROVAL',
      clientId: client.id,
      projectId: project.id,
    },
  });

  await prisma.uploadedFile.upsert({
    where: { id: 'file-seed-2' },
    update: {},
    create: {
      id: 'file-seed-2',
      fileName: 'spring_leads.xlsx',
      fileType: 'Excel',
      recordCount: 1000,
      status: 'APPROVED',
      clientId: client.id,
      projectId: project2.id,
    },
  });

  console.log('✅ Sample files seeded');

  // ── Audit log ─────────────────────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_BOOT',
      actor: 'system',
      details: 'CRM Platform database initialized.',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('\n🎉 Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Login credentials:');
  console.log('  Super Admin: superadmin@gmail.com / AdminPass123!');
  console.log('  Admin:       admin@gmail.com       / AdminPass123!');
  console.log('  Client:      client@gmail.com      / AdminPass123!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
