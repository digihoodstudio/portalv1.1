import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { requireAuth, signToken } from '@/lib/auth';

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

export async function PATCH(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    const { name, email, phone, business, password } = await req.json();

    const dbUser = await prisma.user.findUnique({ where: { id: auth.user.id }, include: { client: true } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (email && email !== dbUser.email) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

    const updatedUser = await prisma.user.update({
      where: { id: auth.user.id },
      data: updateData,
      include: { role: true, client: true },
    });

    if (updatedUser.clientId) {
      const clientUpdate: any = {};
      if (business !== undefined) clientUpdate.companyName = business;
      if (name !== undefined) clientUpdate.contactName = name;
      if (email !== undefined) clientUpdate.contactEmail = email;
      if (phone !== undefined) clientUpdate.contactPhone = phone;
      await prisma.client.update({ where: { id: updatedUser.clientId }, data: clientUpdate });
    }

    const token = signToken({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role?.name ?? 'USER' });

    return NextResponse.json({
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role?.name,
        phone: updatedUser.phone || updatedUser.client?.contactPhone || phone || '',
        business: updatedUser.client?.companyName || business || '',
        adminId: (updatedUser as any).adminId || '',
        clientId: updatedUser.clientId || '',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
