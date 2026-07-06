import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendLeadNotification(lead: {
  name: string;
  email: string;
  phone?: string;
  business?: string;
  source?: string;
}) {
  const to = 'info@digihoodstudio.com';

  const html = `
    <h2>New Lead Submission</h2>
    <table style="border-collapse:collapse;width:100%;max-width:500px;">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${lead.name}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${lead.email}</td></tr>
      ${lead.phone ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Phone</td><td style="padding:8px;border:1px solid #ddd;">${lead.phone}</td></tr>` : ''}
      ${lead.business ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Business</td><td style="padding:8px;border:1px solid #ddd;">${lead.business}</td></tr>` : ''}
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Source</td><td style="padding:8px;border:1px solid #ddd;">${lead.source || 'Web Form'}</td></tr>
    </table>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Digihood Studio" <${process.env.SMTP_USER || 'noreply@digihoodstudio.com'}>`,
      to,
      subject: `New Lead: ${lead.name}${lead.business ? ` — ${lead.business}` : ''}`,
      html,
    });
    console.log('Lead notification email sent to', to);
  } catch (err) {
    console.error('Failed to send lead notification email:', err);
  }
}
