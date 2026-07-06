import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { requireAuth, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, roleName, phoneNumber, businessName } = await req.json();
    if (!email || !password || !roleName) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) return NextResponse.json({ error: `Invalid role: ${roleName}` }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 12);

    let clientId: string | undefined = undefined;
    if (['CLIENT', 'ADMIN', 'USER'].includes(roleName)) {
      const client = await prisma.client.create({
        data: {
          companyName: businessName || 'My Business',
          contactName: name || 'Client User',
          contactEmail: email,
          contactPhone: phoneNumber || '',
          plan: 'GROWTH',
          status: 'ACTIVE',
        },
      });
      clientId = client.id;
    }

    const user = await prisma.user.create({
      data: { email, name, passwordHash, roleId: role.id, clientId },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: role.name,
        phone: phoneNumber || '',
        business: businessName || '',
        agentId: (user as any).agentId || '',
        clientId: user.clientId || '',
      },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'An error occurred during registration' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: auth.user.id },
      include: { role: true, client: true },
    });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role?.name,
        phone: dbUser.phone || dbUser.client?.contactPhone || '',
        business: dbUser.client?.companyName || '',
        adminId: (dbUser as any).adminId || '',
        clientId: dbUser.clientId || '',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
