import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true, client: true },
    });

    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    if (user.suspended) return NextResponse.json({ error: 'Your account has been suspended. Contact support.' }, { status: 403 });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ id: user.id, email: user.email, role: user.role?.name ?? 'USER' });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role?.name,
        phone: user.phone || (user as any).client?.contactPhone || '',
        business: (user as any).client?.companyName || '',
        adminId: (user as any).adminId || '',
        clientId: user.clientId || '',
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
}
