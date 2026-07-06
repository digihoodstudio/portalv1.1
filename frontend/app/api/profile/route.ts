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

    const { data: client } = dbUser.client_id
      ? await supabase.from('clients').select('*').eq('id', dbUser.client_id).single()
      : { data: null };

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role?.name,
        phone: dbUser.phone || client?.contact_phone || '',
        business: client?.company_name || '',
        adminId: dbUser.admin_id || '',
        clientId: dbUser.client_id || '',
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
    if (password) updateData.password_hash = await bcrypt.hash(password, 12);

    const { data: updatedUser } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', auth.user.id)
      .select('*, role:roles(*)')
      .single();

    if (updatedUser?.client_id && business !== undefined) {
      await supabase.from('clients').update({ company_name: business }).eq('id', updatedUser.client_id);
    }

    const token = signToken({ id: updatedUser!.id, email: updatedUser!.email, role: updatedUser!.role?.name ?? 'USER' });

    const { data: client } = updatedUser!.client_id
      ? await supabase.from('clients').select('*').eq('id', updatedUser!.client_id).single()
      : { data: null };

    return NextResponse.json({
      token,
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        name: updatedUser!.name,
        role: updatedUser!.role?.name,
        phone: updatedUser!.phone || client?.contact_phone || phone || '',
        business: client?.company_name || business || '',
        adminId: updatedUser!.admin_id || '',
        clientId: updatedUser!.client_id || '',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
