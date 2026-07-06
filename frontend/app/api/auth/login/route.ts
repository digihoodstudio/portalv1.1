import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { signToken } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const USER_INFO: Record<string, { name: string; role: string; phone: string; business: string }> = {
  'admin@digihoodstudio.com': { name: 'Admin', role: 'ADMIN', phone: '', business: '' },
  'superadmin@gmail.com': { name: 'Super Admin', role: 'SUPERADMIN', phone: '', business: '' },
  'client@gmail.com': { name: 'John Doe', role: 'CLIENT', phone: '555-0188', business: 'Septic & Drain Specialists' },
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      if (authError.message?.includes('Invalid login credentials')) {
        const { error: createErr } = await supabase.auth.admin.createUser({
          email, password, email_confirm: true,
        });
        if (createErr) {
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        const { data: retryData, error: retryErr } = await supabase.auth.signInWithPassword({ email, password });
        if (retryErr || !retryData?.user) {
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        const info = USER_INFO[email] ?? { name: email.split('@')[0], role: 'USER', phone: '', business: '' };
        const token = signToken({ id: retryData.user.id, email: retryData.user.email!, role: info.role });
        return NextResponse.json({
          token, user: { id: retryData.user.id, email: retryData.user.email, name: info.name, role: info.role, phone: info.phone, business: info.business, adminId: '', clientId: '' },
        });
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!authData?.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const info = USER_INFO[email] ?? { name: email.split('@')[0], role: 'USER', phone: '', business: '' };
    const token = signToken({ id: authData.user.id, email: authData.user.email!, role: info.role });

    return NextResponse.json({
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: info.name,
        role: info.role,
        phone: info.phone,
        business: info.business,
        adminId: '',
        clientId: '',
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 });
  }
}
