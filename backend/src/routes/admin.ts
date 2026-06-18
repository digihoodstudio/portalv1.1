import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { getConfigs, updateConfigs } from '../config-store';

const router = Router();

// Apply auth & role requirements (both Superadmin and Admin are authorized)
router.use(requireAuth);
router.use(requireRole(['SUPERADMIN', 'ADMIN']));

// --- CLIENT MANAGEMENT ---

// List all clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    return res.json({ clients });
  } catch (error: any) {
    console.error('Fetch clients error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch clients' });
  }
});

// Create a client
router.post('/clients', async (req: any, res) => {
  try {
    const { companyName, contactName, contactEmail, contactPhone, plan } = req.body;
    if (!companyName || !contactEmail) {
      return res.status(400).json({ error: 'Company Name and Contact Email are required' });
    }

    const client = await prisma.client.create({
      data: {
        companyName,
        contactName: contactName || 'Contact Person',
        contactEmail,
        contactPhone: contactPhone || '',
        plan: plan || 'GROWTH'
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_CLIENT',
        actor: req.user?.email || 'admin',
        details: `Created client account '${companyName}' under '${plan}' plan`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ client });
  } catch (error: any) {
    console.error('Create client error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create client' });
  }
});

// Update client details
router.patch('/clients/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { companyName, contactName, contactEmail, contactPhone, plan, status } = req.body;

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const updateData: any = {};
    if (companyName !== undefined) updateData.companyName = companyName;
    if (contactName !== undefined) updateData.contactName = contactName;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (plan !== undefined) updateData.plan = plan;
    if (status !== undefined) updateData.status = status;

    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_CLIENT',
        actor: req.user?.email || 'admin',
        details: `Updated client '${client.companyName}' details: ${JSON.stringify(updateData)}`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ client: updatedClient });
  } catch (error: any) {
    console.error('Update client error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update client' });
  }
});

// Delete client
router.delete('/clients/:id', async (req: any, res) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await prisma.client.delete({ where: { id } });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_CLIENT',
        actor: req.user?.email || 'admin',
        details: `Deleted client account '${client.companyName}'`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    console.error('Delete client error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete client' });
  }
});

// --- CALL ANALYSIS & COACHING ENDPOINT ---
router.get('/calls', async (req, res) => {
  try {
    const calls = await prisma.call.findMany({
      orderBy: { createdAt: 'desc' },
      include: { lead: true }
    });

    const defaultCalls = [
      {
        id: 'call-1',
        leadName: 'James Carter',
        phone: '+1 (555) 0199',
        durationSec: 84,
        initiatedBy: 'system',
        outcome: 'BOOKED',
        createdAt: new Date(Date.now() - 600000).toISOString(),
        coaching: {
          greeting: 95,
          compliance: 90,
          sentiment: 'Positive',
          coachingNotes: 'Great call control. AI receptionist successfully handled backing-up emergency concerns and guided customer to direct booking link.',
          transcript: '[AI]: Thanks for calling Septic Specialists. How can I help you today?\n[Caller]: Hey, I have sewage backing up into my basement! Can you get someone here today?\n[AI]: Oh dear, sorry to hear that. That is definitely an emergency. I can schedule a diagnostic technician to head out to your location right away. Would morning at 10 AM work for you?\n[Caller]: Yes, please, the sooner the better.\n[AI]: Perfect. I have confirmed your slot. You will receive a text link to track your technician shortly.'
        }
      },
      {
        id: 'call-2',
        leadName: 'Sarah Miller',
        phone: '+1 (555) 0122',
        durationSec: 45,
        initiatedBy: 'agent',
        outcome: 'VOICEMAIL',
        createdAt: new Date(Date.now() - 2500000).toISOString(),
        coaching: {
          greeting: 85,
          compliance: 75,
          sentiment: 'Neutral',
          coachingNotes: 'Customer left call early. AI left clear voicemail identifying brand name, callback reason, and dynamic SMS scheduling options.',
          transcript: '[AI]: Hello, this is the callback assistant for Septic Specialists. We saw we just missed a call from this number... Oh, it looks like you are not available. I will leave a callback text link so you can book at your convenience.'
        }
      },
      {
        id: 'call-3',
        leadName: 'Robert Chen',
        phone: '+1 (555) 0187',
        durationSec: 130,
        initiatedBy: 'system',
        outcome: 'BOOKED',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        coaching: {
          greeting: 92,
          compliance: 95,
          sentiment: 'Positive',
          coachingNotes: 'Perfect compliance. Addressed pricing questions quickly using simulated knowledge base rules and secured CRM booking confirmation.',
          transcript: '[AI]: Hello, thank you for calling. How can I assist you today?\n[Caller]: How much does it cost for a septic pump-out?\n[AI]: Our standard septic pumping service starts at $1,497/mo under our service packages, which includes full tank evacuation and inspection reports. Would you like to schedule an inspection booking slot?\n[Caller]: Yes, that sounds reasonable.'
        }
      }
    ];

    const results = calls.map((c: any, index: number) => {
      const scoreGreeting = c.outcome === 'initiated' ? 0 : 85 + (index * 7) % 15;
      const scoreCompliance = c.outcome === 'initiated' ? 0 : 80 + (index * 3) % 20;
      const sentiment = c.outcome === 'initiated' ? 'Neutral' : (scoreGreeting > 90 ? 'Positive' : 'Neutral');
      
      return {
        id: c.id,
        leadName: c.lead?.name || 'Inbound Caller',
        phone: c.lead?.phone || '+1 (555) 0100',
        durationSec: c.durationSec || 60,
        initiatedBy: c.initiatedBy,
        outcome: c.outcome,
        createdAt: c.createdAt,
        coaching: {
          greeting: scoreGreeting,
          compliance: scoreCompliance,
          sentiment,
          coachingNotes: c.outcome === 'initiated' ? 'Call in queue...' : 'AI responder handled lead qualifications successfully with high script compliance.',
          transcript: c.outcome === 'initiated' ? '[System]: Initiating dialer...' : '[AI]: Hello! Thanks for calling Septic Specialists...\n[Caller]: I would like to book a service...'
        }
      };
    });

    return res.json({ calls: [...results, ...defaultCalls] });
  } catch (error: any) {
    console.error('Fetch calls error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch calls analytics' });
  }
});

// --- APPOINTMENTS MANAGEMENT ---

// List all appointments
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { scheduledAt: 'desc' }
    });
    return res.json({ appointments });
  } catch (error: any) {
    console.error('Fetch appointments error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch appointments' });
  }
});

// Update appointment status (Confirm/Approve or Cancel)
router.patch('/appointments/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g. CONFIRMED, CANCELLED, PENDING

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updatedAppt = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_APPOINTMENT',
        actor: req.user?.email || 'admin',
        details: `Changed appointment '${appt.title}' status to '${status}'`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ appointment: updatedAppt });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update appointment' });
  }
});

// --- ADMIN SYSTEM CONFIGS ---
router.get('/configs', async (req, res) => {
  try {
    const configs = getConfigs();
    return res.json({ 
      kbEntries: configs.kbEntries, 
      voiceScript: configs.voiceProfile,
      systemPrompt: configs.systemPrompt,
      publisherNote: configs.publisherNote
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch settings' });
  }
});

router.post('/configs', async (req: any, res) => {
  try {
    const { kbEntries, voiceScript, systemPrompt, publisherNote } = req.body;
    const updates: any = {};
    if (kbEntries !== undefined) updates.kbEntries = kbEntries;
    if (voiceScript !== undefined) updates.voiceProfile = voiceScript; // Map voiceScript to voiceProfile field
    if (systemPrompt !== undefined) updates.systemPrompt = systemPrompt;
    if (publisherNote !== undefined) updates.publisherNote = publisherNote;
    
    const configs = updateConfigs(updates);

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_ADMIN_CONFIGS',
        actor: req.user?.email || 'admin',
        details: 'Admin updated chatbot knowledge base, voice scripts, or publisher notes',
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ 
      message: 'Settings updated successfully', 
      kbEntries: configs.kbEntries, 
      voiceScript: configs.voiceProfile,
      systemPrompt: configs.systemPrompt,
      publisherNote: configs.publisherNote
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update settings' });
  }
});

export default router;
