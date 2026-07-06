import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, roleName, phoneNumber, businessName } = await req.json();
    if (!email || !password || !roleName) {
      return NextResponse.json({ error: 'Email, password, and role are required' }, { status: 400 });
    }

    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
    if (existingUser) return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });

    const { data: role } = await supabase.from('roles').select('*').eq('name', roleName).single();
    if (!role) return NextResponse.json({ error: `Invalid role: ${roleName}` }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 12);

    let clientId: string | undefined = undefined;
    if (['CLIENT', 'ADMIN', 'USER'].includes(roleName)) {
      const { data: client } = await supabase.from('clients').insert({
        companyName: businessName || 'My Business',
        contactName: name || 'Client User',
        contactEmail: email,
        contactPhone: phoneNumber || '',
        plan: 'GROWTH',
        status: 'ACTIVE',
      }).select().single();
      if (client) clientId = client.id;
    }

    const { data: user } = await supabase.from('users').insert({
      email, name, passwordHash, roleId: role.id, clientId,
    }).select().single();

    return NextResponse.json({
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        role: role.name,
        phone: phoneNumber || '',
        business: businessName || '',
        agentId: '',
        clientId: user!.clientId || '',
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
    const { data: dbUser } = await supabase
      .from('users')
      .select('*, role:roles(*)')
      .eq('id', auth.user.id)
      .single();

    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { data: client } = dbUser.clientId
      ? await supabase.from('clients').select('*').eq('id', dbUser.clientId).single()
      : { data: null };

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role?.name,
        phone: dbUser.phone || client?.contactPhone || '',
        business: client?.companyName || '',
        adminId: dbUser.adminId || '',
        clientId: dbUser.clientId || '',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
