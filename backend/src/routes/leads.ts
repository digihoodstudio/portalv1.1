import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

function parseSlotToDate(slot: string): Date {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  const slotLower = slot.toLowerCase();
  let targetDayIndex = days.findIndex(day => slotLower.includes(day));
  if (targetDayIndex === -1) targetDayIndex = 1;

  let daysDiff = targetDayIndex - now.getDay();
  if (daysDiff <= 0) daysDiff += 7;
  
  const targetDate = new Date(now.getTime() + daysDiff * 24 * 60 * 60 * 1000);

  let hour = 10;
  let minute = 0;
  const match = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    hour = parseInt(match[1]);
    minute = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
  }

  targetDate.setHours(hour, minute, 0, 0);
  return targetDate;
}

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, business, source, clientId } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone: phone || '',
        business: business || '',
        source: source || 'Web Form',
        status: 'NEW',
        clientId: clientId || 'client-default'
      }
    });

    if (source && (source.startsWith('Demo Booking –') || source.startsWith('Demo Booking -') || source.startsWith('Demo Booking'))) {
      try {
        const slotText = source.replace(/Demo Booking\s*[-–]\s*/i, '').trim();
        const scheduledAt = parseSlotToDate(slotText);
        await prisma.appointment.create({
          data: {
            clientId: lead.clientId,
            leadId: lead.id,
            title: `AI Consultation: ${lead.name} (${lead.business || 'New Lead'})`,
            scheduledAt,
            status: 'PENDING',
            notes: `Auto-scheduled from site demo booking form. Slot requested: ${slotText}`
          }
        });
      } catch (err) {
        console.error('Failed to auto-create appointment for booked demo lead:', err);
      }
    }

    return res.json({ lead });
  } catch (error) {
    console.error('Lead creation error:', error);
    return res.status(500).json({ error: 'An error occurred while creating the lead' });
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const clientId = req.query.clientId as string | undefined;
    const filter = clientId ? { clientId } : {};
    const leads = await prisma.lead.findMany({ 
      where: filter, 
      orderBy: { createdAt: 'desc' } 
    });
    return res.json({ leads });
  } catch (error) {
    console.error('Leads fetch error:', error);
    return res.status(500).json({ error: 'An error occurred while fetching leads' });
  }
});

// Update lead status/details
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, name, email, phone, business } = req.body;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (business !== undefined) updateData.business = business;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: updateData
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_LEAD',
        actor: req.user?.email || 'user',
        details: `Updated status/info of lead '${lead.name}'`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ lead: updatedLead });
  } catch (error) {
    console.error('Lead update error:', error);
    return res.status(500).json({ error: 'An error occurred while updating the lead' });
  }
});

// Delete lead
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    await prisma.lead.delete({ where: { id } });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_LEAD',
        actor: req.user?.email || 'user',
        details: `Deleted lead record of '${lead.name}'`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Lead delete error:', error);
    return res.status(500).json({ error: 'An error occurred while deleting the lead' });
  }
});

export default router;
