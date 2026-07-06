import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, call_id, status, recording_url, transcript } = body;

    console.log('[Vapi Webhook] Received:', { type, call_id, status });

    switch (type) {
      case 'call.started':
        console.log(`Call started: ${call_id}`);
        break;
      case 'call.ended':
        console.log(`Call ended: ${call_id}, status: ${status}`);
        break;
      case 'call.transcript':
        console.log(`Transcript for ${call_id}:`, transcript);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Vapi webhook error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Vapi webhook endpoint ready' }, { status: 200 });
}
