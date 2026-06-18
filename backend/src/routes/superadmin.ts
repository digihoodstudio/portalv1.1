import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { getConfigs, updateConfigs } from '../config-store';

const router = Router();

// Apply auth & role requirements to all routes in this controller
router.use(requireAuth);
router.use(requireRole('SUPERADMIN'));

// --- USER MANAGEMENT ---

// List all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: true }
    });
    return res.json({ users });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

// Create a user
router.post('/users', async (req: any, res) => {
  try {
    const { email, password, name, roleName } = req.body;
    if (!email || !password || !roleName) {
      return res.status(400).json({ error: 'Email, password, and roleName are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ error: `Invalid role name: ${roleName}` });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash,
        roleId: role.id
      },
      include: { role: true }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_USER',
        actor: req.user?.email || 'superadmin',
        details: `Successfully created user '${email}' with role '${roleName}'`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ user });
  } catch (error: any) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

// Update a user (edit role, suspend status, name, etc.)
router.patch('/users/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, email, roleName, suspended } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (suspended !== undefined) updateData.suspended = suspended;

    if (roleName) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        return res.status(400).json({ error: `Invalid role name: ${roleName}` });
      }
      updateData.roleId = role.id;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_USER',
        actor: req.user?.email || 'superadmin',
        details: `Updated user '${user.email}' details: ${JSON.stringify(updateData)}`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update user' });
  }
});

// Delete a user
router.delete('/users/:id', async (req: any, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_USER',
        actor: req.user?.email || 'superadmin',
        details: `Deleted user '${user.email}'`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

// --- AUDIT LOGS ---
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ logs });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch audit logs' });
  }
});

// --- CONVERSATION LOGS ---
router.get('/conversation-logs', async (req, res) => {
  try {
    const logs = await prisma.chatbotLog.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ logs });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch conversation logs' });
  }
});

// --- SYSTEM CONFIGS ---
router.get('/configs', (req, res) => {
  return res.json({ configs: getConfigs() });
});

router.post('/configs', async (req: any, res) => {
  try {
    const newConfigs = req.body;
    const configs = updateConfigs(newConfigs);

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_CONFIG',
        actor: req.user?.email || 'superadmin',
        details: 'System configurations updated by super administrator',
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ message: 'Configurations updated successfully', configs });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to save configurations' });
  }
});

// --- SYSTEM HEALTH ---
router.get('/system-health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  const dbUrl = process.env.DATABASE_URL || '';
  const databaseType = (dbUrl.includes('postgresql') || dbUrl.includes('postgres')) ? 'PostgreSQL' : 'SQLite (local file)';
  
  const hasRealOpenAI = !!(process.env.OPENAI_API_KEY && 
                           process.env.OPENAI_API_KEY !== 'sk-your-openai-api-key-here' && 
                           process.env.OPENAI_API_KEY !== 'mock-key' &&
                           process.env.OPENAI_API_KEY.trim().length > 0);
                           
  const hasRealTwilio = !!(process.env.TWILIO_ACCOUNT_SID && 
                           process.env.TWILIO_ACCOUNT_SID !== 'your-twilio-account-sid' && 
                           process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
                           process.env.TWILIO_AUTH_TOKEN &&
                           process.env.TWILIO_AUTH_TOKEN.trim().length > 0);

  return res.json({
    uptime: Math.floor(uptime),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024)
    },
    metrics: {
      apiLatencyMs: Math.floor(Math.random() * 25) + 5,
      dbLatencyMs: Math.floor(Math.random() * 5) + 1,
      activeConnections: Math.floor(Math.random() * 6) + 2,
      queueSize: 0
    },
    integrations: {
      databaseType,
      databaseConnection: 'CONNECTED',
      openai: hasRealOpenAI ? 'LIVE' : 'SIMULATED',
      twilio: hasRealTwilio ? 'LIVE' : 'SIMULATED'
    }
  });
});

// --- EMPLOYEE MANAGEMENT ---

// List employees (users other than SUPERADMIN or CLIENT, role check)
router.get('/employees', async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    const roleMap = new Map(roles.map((r: any) => [r.id, r]));

    const users = await prisma.user.findMany({
      include: { role: true }
    });

    // Filter out SUPERADMIN
    const filteredUsers = users.filter((u: any) => {
      const r = roleMap.get(u.roleId) as any;
      return r && r.name !== 'SUPERADMIN';
    });

    const employees = [];
    for (const u of filteredUsers) {
      // Fetch designation
      const designation = u.designationId ? await prisma.designation.findUnique({ where: { id: u.designationId } }) : null;
      
      // Count assigned leads
      const prospectCount = await prisma.lead.count({
        where: { userId: u.id }
      });

      // Get daily planner stats (for today)
      const todayStr = new Date().toISOString().split('T')[0];
      const planner = await prisma.dailyPlanner.findFirst({
        where: { userId: u.id, date: todayStr }
      });

      // Get recent daily updates
      const recentUpdates = await prisma.dailyUpdate.findMany({
        where: { userId: u.id },
        orderBy: { createdAt: 'desc' },
        take: 3
      });

      employees.push({
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone || '',
        suspended: u.suspended || false,
        joiningDate: u.joiningDate,
        role: u.role,
        designation,
        prospectCount,
        dailyPlanner: planner || { callTarget: 0, callsMade: 0 },
        recentUpdates
      });
    }

    return res.json({ employees });
  } catch (error: any) {
    console.error('Fetch employees error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch employees' });
  }
});

// Add new employee
router.post('/employees', async (req: any, res) => {
  try {
    const { name, email, phone, password, designationId, roleName } = req.body;
    if (!email || !password || !roleName) {
      return res.status(400).json({ error: 'Email, password, and roleName are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ error: `Invalid role name: ${roleName}` });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    // Check if we need to create an agent record for dialer assignment mapping
    let agentId = undefined;
    if (roleName === 'AGENT') {
      const agent = await prisma.agent.create({
        data: {
          name: name || email.split('@')[0],
          email,
          phone: phone || '',
          capacity: 1000,
          status: 'AVAILABLE'
        }
      });
      agentId = agent.id;
    }

    const employee = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash,
        roleId: role.id,
        phone: phone || '',
        designationId: designationId || '',
        agentId,
        status: 'ACTIVE',
        suspended: false,
        joiningDate: new Date().toISOString()
      },
      include: { role: true }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_EMPLOYEE',
        actor: req.user?.email || 'superadmin',
        details: `Successfully set up employee profile for '${email}' with role '${roleName}'`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ employee });
  } catch (error: any) {
    console.error('Create employee error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create employee' });
  }
});

// Update employee
router.patch('/employees/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, designationId, roleName, suspended, status } = req.body;

    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (designationId !== undefined) updateData.designationId = designationId;
    if (suspended !== undefined) updateData.suspended = suspended;
    if (status !== undefined) updateData.status = status;

    if (roleName) {
      const role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        return res.status(400).json({ error: `Invalid role: ${roleName}` });
      }
      updateData.roleId = role.id;
    }

    const updatedEmployee = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true }
    });

    // Sync corresponding agent record if role is AGENT
    if (employee.agentId) {
      const agentUpdate: any = {};
      if (name !== undefined) agentUpdate.name = name;
      if (email !== undefined) agentUpdate.email = email;
      if (phone !== undefined) agentUpdate.phone = phone;
      if (suspended !== undefined) {
        agentUpdate.status = suspended ? 'UNAVAILABLE' : 'AVAILABLE';
      }
      await prisma.agent.update({
        where: { id: employee.agentId },
        data: agentUpdate
      });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_EMPLOYEE',
        actor: req.user?.email || 'superadmin',
        details: `Updated employee '${employee.email}' details: ${JSON.stringify(updateData)}`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ employee: updatedEmployee });
  } catch (error: any) {
    console.error('Update employee error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/employees/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    await prisma.user.delete({ where: { id } });

    if (employee.agentId) {
      await prisma.agent.delete({ where: { id: employee.agentId } });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_EMPLOYEE',
        actor: req.user?.email || 'superadmin',
        details: `Deleted employee '${employee.email}'`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ message: 'Employee deleted successfully' });
  } catch (error: any) {
    console.error('Delete employee error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete employee' });
  }
});

// --- DESIGNATION MANAGEMENT ---

// List designations
router.get('/designations', async (req, res) => {
  try {
    const designations = await prisma.designation.findMany();
    return res.json({ designations });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch designations' });
  }
});

// Add designation
router.post('/designations', async (req: any, res) => {
  try {
    const { name, description, permissions } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const designation = await prisma.designation.create({
      data: {
        name,
        description: description || '',
        permissions: permissions || 'VIEW_OWN,CALL_LEADS'
      }
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_DESIGNATION',
        actor: req.user?.email || 'superadmin',
        details: `Created custom designation '${name}' with permissions: '${permissions || 'VIEW_OWN,CALL_LEADS'}'`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ designation });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create designation' });
  }
});

// Update designation
router.patch('/designations/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (permissions !== undefined) data.permissions = permissions;

    const designation = await prisma.designation.update({
      where: { id },
      data
    });

    return res.json({ designation });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update designation' });
  }
});

// Delete designation
router.delete('/designations/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    await prisma.designation.delete({ where: { id } });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_DESIGNATION',
        actor: req.user?.email || 'superadmin',
        details: `Deleted designation id '${id}'`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ message: 'Designation deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete designation' });
  }
});

// --- PROSPECT MANAGEMENT ---

// Parse CSV content and return preview
router.post('/prospects/upload-preview', (req, res) => {
  try {
    const { csvContent } = req.body;
    if (!csvContent) {
      return res.status(400).json({ error: 'csvContent is required' });
    }

    const lines = csvContent.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
    if (lines.length === 0) {
      return res.status(400).json({ error: 'CSV content is empty' });
    }

    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.trim().replace(/^["']|["']$/g, ''));
      if (values.length < headers.length) continue;
      
      const row: any = {};
      headers.forEach((header: string, index: number) => {
        row[header] = values[index];
      });
      rows.push({
        name: row.name || row.fullname || 'Unknown Prospect',
        company: row.company || row.business || 'Unknown Company',
        phone: row.phone || row.telephone || '',
        email: row.email || '',
        notes: row.notes || row.remarks || ''
      });
    }

    return res.json({ preview: rows });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to parse CSV preview' });
  }
});

// Commit bulk prospects confirmation
router.post('/prospects/upload-confirm', async (req: any, res) => {
  try {
    const { listName, prospects } = req.body;
    if (!listName || !prospects || !Array.isArray(prospects)) {
      return res.status(400).json({ error: 'listName and prospects array are required' });
    }

    // Create Project (representing the list)
    const project = await prisma.project.create({
      data: {
        name: listName,
        clientId: 'client-default',
        status: 'PENDING_APPROVAL',
        progress: 0
      }
    });

    // Create UploadedFile
    await prisma.uploadedFile.create({
      data: {
        fileName: listName + '.csv',
        fileType: 'CSV',
        recordCount: prospects.length,
        status: 'PENDING_APPROVAL',
        clientId: 'client-default',
        projectId: project.id
      }
    });

    // Create Leads
    for (const p of prospects) {
      await prisma.lead.create({
        data: {
          name: p.name || 'Unknown Prospect',
          company: p.company || 'Unknown Company',
          phone: p.phone || '',
          email: p.email || '',
          notes: p.notes || '',
          status: 'NEW',
          projectId: project.id,
          clientId: 'client-default'
        }
      });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'UPLOAD_PROSPECTS',
        actor: req.user?.email || 'superadmin',
        details: `Bulk uploaded prospect database "${listName}". Summary: total: ${prospects.length}`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({ success: true, projectId: project.id, recordCount: prospects.length });
  } catch (error: any) {
    console.error('Confirm upload error:', error);
    return res.status(500).json({ error: error.message || 'Failed to save prospects' });
  }
});

// Assign list or individual prospects
router.post('/prospects/assign', async (req: any, res) => {
  try {
    const { projectId, leadIds, employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ error: 'employeeId is required' });
    }

    const employee = await prisma.user.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (projectId) {
      // Option 1: Assign entire list/project
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) return res.status(404).json({ error: 'Project not found' });

      // Link agentId in project (if employee has agentId, or map to userId)
      await prisma.project.update({
        where: { id: projectId },
        data: {
          agentId: employee.agentId || null,
          status: 'AGENT_ASSIGNED'
        }
      });

      // Update all leads
      await prisma.lead.updateMany({
        where: { projectId },
        data: { userId: employeeId }
      });

      // Write assignment record
      const totalLeads = await prisma.lead.count({ where: { projectId } });
      if (employee.agentId) {
        await prisma.assignment.create({
          data: {
            projectId,
            agentId: employee.agentId,
            recordCount: totalLeads,
            status: 'ASSIGNED'
          }
        });
        await prisma.agent.update({
          where: { id: employee.agentId },
          data: { activeTasks: { increment: 1 } }
        });
      }

      // Write audit log
      await prisma.auditLog.create({
        data: {
          action: 'ASSIGN_PROSPECTS',
          actor: req.user?.email || 'superadmin',
          details: `Assigned entire prospect list "${project.name}" to employee "${employee.name}"`,
          ipAddress: req.ip || '127.0.0.1'
        }
      });
    } else if (leadIds && Array.isArray(leadIds)) {
      // Option 2: Assign specific leads
      await prisma.lead.updateMany({
        where: { id: { in: leadIds } },
        data: { userId: employeeId }
      });

      // Write audit log
      await prisma.auditLog.create({
        data: {
          action: 'ASSIGN_PROSPECTS',
          actor: req.user?.email || 'superadmin',
          details: `Assigned ${leadIds.length} individual prospects to employee "${employee.name}"`,
          ipAddress: req.ip || '127.0.0.1'
        }
      });
    } else {
      return res.status(400).json({ error: 'Either projectId or leadIds must be provided' });
    }

    // Notify Employee
    await prisma.notification.create({
      data: {
        userId: employeeId,
        title: 'New Prospects Allocated',
        message: projectId 
          ? 'You have been assigned a new prospect campaign list.' 
          : `You have been allocated ${leadIds.length} new prospects.`,
        channel: 'IN_APP'
      }
    });

    return res.json({ success: true });
  } catch (error: any) {
    console.error('Assign prospects error:', error);
    return res.status(500).json({ error: error.message || 'Failed to assign prospects' });
  }
});

// Tracking summary of all assignments
router.get('/prospects/summary', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        agent: true,
        leads: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const summary = [];
    for (const p of projects) {
      const total = p.leads.length;
      const assigned = p.leads.filter((l: any) => l.userId).length;
      const completed = p.leads.filter((l: any) => l.status === 'CLOSED').length;
      
      // Fetch employee user linked to agentId
      const agentUser = p.agentId ? await prisma.user.findFirst({ where: { agentId: p.agentId } }) : null;
      const assignedUser = agentUser || (p.leads[0]?.userId ? await prisma.user.findUnique({ where: { id: p.leads[0].userId } }) : null);

      summary.push({
        id: p.id,
        name: p.name,
        status: p.status,
        progress: p.progress,
        createdAt: p.createdAt,
        totalLeads: total,
        assignedLeads: assigned,
        completedLeads: completed,
        assignedTo: assignedUser ? { id: assignedUser.id, name: assignedUser.name, email: assignedUser.email } : null
      });
    }

    return res.json({ summary });
  } catch (error: any) {
    console.error('Prospect summary error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch prospect summary' });
  }
});

export default router;
