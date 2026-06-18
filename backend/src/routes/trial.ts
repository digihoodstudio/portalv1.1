import { Router } from 'express';
import twilio from 'twilio';
import { prisma } from '../prisma';
import { getConfigs } from '../config-store';

const router = Router();

router.post('/trial', async (req, res) => {
  try {
    const { phone, industry } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const configs = getConfigs();
    const activeSid = configs.twilioAccountSid;
    const activeToken = configs.twilioAuthToken;
    const activePhone = configs.twilioPhoneNumber;

    let isRealCall = false;
    let callSid = 'trial-mock-' + Math.random().toString(36).substring(7);

    // If Twilio settings are configured, attempt an actual outbound call
    if (activeSid && activeToken && activeSid.startsWith('AC') && activeToken.trim().length > 0) {
      try {
        const client = twilio(activeSid, activeToken);
        const call = await client.calls.create({
          url: process.env.TWILIO_CALLBACK_URL ?? 'http://demo.twilio.com/docs/voice.xml',
          to: phone,
          from: activePhone || '+15550100'
        });
        callSid = call.sid;
        isRealCall = true;
      } catch (err) {
        console.error('Twilio Voice AI Trial call failed to establish:', err);
      }
    }

    // Log the voice trial action in database audit trail for completeness
    await prisma.auditLog.create({
      data: {
        action: 'VOICE_TRIAL_TRIGGERED',
        actor: 'anonymous_visitor',
        details: `Triggered ${industry || 'general'} voice AI trial call to ${phone} (Real Call: ${isRealCall})`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ success: true, isRealCall, callSid });
  } catch (error) {
    console.error('Voice trial endpoint error:', error);
    return res.status(500).json({ error: 'Failed to trigger voice AI trial call' });
  }
});

export default router;
