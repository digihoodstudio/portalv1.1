import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, signToken } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

export async function PATCH(req: NextRequest) {
  const auth = requireAuth(req);
  if ('error' in auth) return auth.error;

  try {
    const { name, email, phone, business, password } = await req.json();

    const { data: dbUser } = await supabase
      .from('users')
      .select('*, role:roles(*)')
      .eq('id', auth.user.id)
      .single();

    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (email && email !== dbUser.email) {
      const { data: exists } = await supabase.from('users').select('id').eq('email', email).single();
      if (exists) return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

    const { data: updatedUser } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', auth.user.id)
      .select('*, role:roles(*)')
      .single();

    if (updatedUser?.clientId && business !== undefined) {
      await supabase.from('clients').update({ companyName: business }).eq('id', updatedUser.clientId);
    }

    const token = signToken({ id: updatedUser!.id, email: updatedUser!.email, role: updatedUser!.role?.name ?? 'USER' });

    const { data: client } = updatedUser!.clientId
      ? await supabase.from('clients').select('*').eq('id', updatedUser!.clientId).single()
      : { data: null };

    return NextResponse.json({
      token,
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        name: updatedUser!.name,
        role: updatedUser!.role?.name,
        phone: updatedUser!.phone || client?.contactPhone || phone || '',
        business: client?.companyName || business || '',
        adminId: updatedUser!.adminId || '',
        clientId: updatedUser!.clientId || '',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
