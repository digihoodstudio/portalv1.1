import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, business, source, clientId } = body;

    const { data, error } = await supabase.from('leads').insert({
      name: name || 'Unknown',
      email: email || '',
      phone: phone || '',
      company: business || '',
      notes: source || '',
      client_id: clientId || null,
      status: 'NEW',
    }).select().single();

    if (error) {
      console.error('Lead insert error:', error);
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Lead created' }, { status: 201 });
  } catch (err: any) {
    console.error('Lead POST error:', err);
    return NextResponse.json({ error: 'Failed to submit. Backend server is not active.' }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
