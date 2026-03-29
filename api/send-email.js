export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, htmlContent } = req.body;
  const BREVO_KEY = process.env.BREVO_KEY;

  if (!BREVO_KEY) {
    return res.status(500).json({ error: 'Server configuration error: BREVO_KEY missing' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: "TheAI Finance Breakdown", email: "onboarding@smarthustlermarketing.com" },
        to: to,
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Email API Error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
