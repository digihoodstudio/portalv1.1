import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { prisma } from '@/lib/db';
import { getConfigs } from '@/lib/config-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, industry } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const configs = getConfigs();
    const activeSid = configs.twilioAccountSid;
    const activeToken = configs.twilioAuthToken;
    const activePhone = configs.twilioPhoneNumber;

    let isRealCall = false;
    let callSid = 'trial-mock-' + Math.random().toString(36).substring(7);

    if (activeSid && activeToken && activeSid.startsWith('AC') && activeToken.trim().length > 0) {
      try {
        const client = twilio(activeSid, activeToken);
        const call = await client.calls.create({
          url: process.env.TWILIO_CALLBACK_URL ?? 'http://demo.twilio.com/docs/voice.xml',
          to: phone,
          from: activePhone || '+15550100',
        });
        callSid = call.sid;
        isRealCall = true;
      } catch (err) {
        console.error('Twilio Voice AI Trial call failed to establish:', err);
      }
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    await prisma.auditLog.create({
      data: {
        action: 'VOICE_TRIAL_TRIGGERED',
        actor: 'anonymous_visitor',
        details: `Triggered ${industry || 'general'} voice AI trial call to ${phone} (Real Call: ${isRealCall})`,
        ipAddress: ip,
      },
    });

    return NextResponse.json({ success: true, isRealCall, callSid }, { status: 200 });
  } catch (error: any) {
    console.error('Voice trial endpoint error:', error);
    return NextResponse.json({ error: 'Failed to trigger voice AI trial call' }, { status: 500 });
  }
}
