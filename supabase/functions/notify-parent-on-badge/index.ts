/**
 * notify-parent-on-badge — Supabase Edge Function (DEMO-07)
 *
 * Triggered by the application after a new badge is awarded.
 * Sends a congratulatory email to the parent via Resend.
 *
 * Deploy: supabase functions deploy notify-parent-on-badge
 *
 * Required Edge Function secrets (supabase secrets set):
 *   RESEND_API_KEY     — https://resend.com/api-keys
 *   FROM_EMAIL         — e.g. noreply@nexgenklick.com (must be verified in Resend)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_URL = 'https://api.resend.com/emails'

interface BadgeAwardPayload {
  studentId: string
  badgeName: string
  badgeEmoji: string
  tier: string
  category?: string
}

Deno.serve(async (req: Request) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let payload: BadgeAwardPayload
  try {
    payload = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { studentId, badgeName, badgeEmoji, tier, category } = payload

  if (!studentId || !badgeName) {
    return new Response(JSON.stringify({ error: 'studentId and badgeName are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Look up student + parent email using service role (bypasses RLS)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('name, parent_email')
    .eq('id', studentId)
    .single()

  if (studentError || !student) {
    return new Response(JSON.stringify({ error: 'Student not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!student.parent_email) {
    // No parent email on record — skip silently
    return new Response(JSON.stringify({ skipped: true, reason: 'No parent_email on record' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const resendKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('FROM_EMAIL') ?? 'noreply@nexgenklick.com'

  if (!resendKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY secret not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const tierLabels: Record<string, string> = {
    gold: '🥇 Gold',
    silver: '🥈 Silver',
    bronze: '🥉 Bronze',
  }
  const tierLabel = tierLabels[tier] ?? tier

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Badge Earned!</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #FFF1F2; margin: 0; padding: 20px; }
    .card { background: white; border-radius: 24px; max-width: 480px; margin: 0 auto; padding: 40px 32px; box-shadow: 0 8px 32px rgba(225,29,72,0.15); }
    .emoji { font-size: 72px; text-align: center; display: block; margin-bottom: 8px; }
    h1 { color: #881337; font-size: 26px; text-align: center; margin: 0 0 8px; }
    .tier { display: inline-block; background: #FFF1F2; color: #E11D48; border: 1.5px solid #FECDD3; border-radius: 999px; padding: 4px 16px; font-size: 14px; font-weight: bold; margin: 0 auto 16px; }
    .student { font-size: 18px; color: #881337; text-align: center; margin-bottom: 16px; }
    p { color: #BE123C; line-height: 1.6; text-align: center; }
    .footer { margin-top: 24px; font-size: 12px; color: #FB7185; text-align: center; }
    .cta { display: block; margin: 24px auto 0; background: linear-gradient(135deg, #FB7185, #E11D48); color: white; text-decoration: none; border-radius: 999px; padding: 14px 32px; font-weight: bold; font-size: 15px; width: fit-content; }
  </style>
</head>
<body>
  <div class="card">
    <span class="emoji">${badgeEmoji}</span>
    <h1>🎉 Badge Earned!</h1>
    <div style="text-align:center"><span class="tier">${tierLabel}</span></div>
    <div class="student"><strong>${student.name}</strong> just earned the <strong>${badgeName}</strong> badge${category ? ` in <strong>${category}</strong>` : ''}!</div>
    <p>Keep up the amazing work! Every achievement brings a new badge, and every badge shows just how hard ${student.name} is working.</p>
    <a class="cta" href="${Deno.env.get('APP_URL') ?? 'https://nexgenklick.com'}/parent/${studentId}">
      View ${student.name}'s Progress →
    </a>
    <div class="footer">
      You received this email because you are listed as a parent/guardian of ${student.name} on NexGenKlick.<br>
      To update your email address, contact your child's teacher.
    </div>
  </div>
</body>
</html>`

  const emailText = `🎉 ${student.name} just earned the ${badgeName} badge (${tierLabel})${category ? ` in ${category}` : ''}!\n\nKeep up the amazing work!\n\n— NexGenKlick`

  const resendResponse = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `NexGenKlick <${fromEmail}>`,
      to: [student.parent_email],
      subject: `🎉 ${student.name} earned the ${badgeName} badge!`,
      html: emailHtml,
      text: emailText,
    }),
  })

  if (!resendResponse.ok) {
    const errorBody = await resendResponse.text()
    console.error('Resend error:', errorBody)
    return new Response(JSON.stringify({ error: 'Email send failed', detail: errorBody }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const result = await resendResponse.json()
  return new Response(JSON.stringify({ success: true, emailId: result.id }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
