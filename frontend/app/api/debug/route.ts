import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const result: Record<string, any> = { supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...' };

  try {
    const { data: users, error } = await supabase.from('users').select('*').limit(3);
    result.allUsers = { count: users?.length ?? 0, error: error?.message ?? null, keys: users?.[0] ? Object.keys(users[0]) : null, sample: users?.[0] ?? null };
  } catch (e: any) { result.allUsers = { error: e.message }; }

  try {
    const { data: admin, error } = await supabase.from('users').select('*').eq('email', 'admin@digihoodstudio.com').single();
    result.admin = { found: !!admin, error: error?.message ?? null, keys: admin ? Object.keys(admin) : null, sample: admin ?? null };
  } catch (e: any) { result.admin = { error: e.message }; }

  return NextResponse.json(result);
}
