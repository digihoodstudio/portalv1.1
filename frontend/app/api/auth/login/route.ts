import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { signToken } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*, role:roles(*)')
      .eq('email', email)
      .single();

    if (error || !user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    if (user.suspended) return NextResponse.json({ error: 'Your account has been suspended. Contact support.' }, { status: 403 });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ id: user.id, email: user.email, role: user.role?.name ?? 'USER' });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role?.name,
        phone: user.phone || '',
        business: '',
        adminId: user.admin_id || '',
        clientId: user.client_id || '',
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
}
