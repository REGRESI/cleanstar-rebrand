import { company, formsConfigured } from '@/content/company'

export interface SubmitResult {
  ok: boolean
  preview: boolean
  error?: string
}

/**
 * Sendet ein Formular an den in company.ts eingetragenen Dienst (Web3Forms oder Formspree).
 * Ohne Eintrag: Vorschau-Modus, nichts wird gesendet, Erfolg wird simuliert.
 */
export async function submitForm(opts: { subject: string; replyTo?: string; name?: string; lines: [string, string][]; botcheck?: string }): Promise<SubmitResult> {
  if (opts.botcheck) return { ok: true, preview: false } // Spam-Schutz (Honeypot)
  const subject = opts.subject
  const message = opts.lines.map(([k, v]) => `${k}: ${v || '–'}`).join('\n')

  if (!formsConfigured()) {
    await new Promise((r) => setTimeout(r, 900))
    if (import.meta.env.DEV) console.info('[Vorschau-Modus] Formular nicht gesendet:\n' + subject + '\n\n' + message)
    return { ok: true, preview: true }
  }

  try {
    const fields = Object.fromEntries(opts.lines)
    const body =
      company.forms.provider === 'web3forms'
        ? {
            access_key: company.forms.accessKey,
            subject,
            from_name: `${company.shortName} Website`,
            name: opts.name,
            email: opts.replyTo,
            replyto: opts.replyTo,
            message,
            ...fields,
          }
        : { _subject: subject, _replyto: opts.replyTo, email: opts.replyTo, name: opts.name, message, ...fields }
    const res = await fetch(company.forms.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return { ok: true, preview: false }
  } catch (e) {
    return { ok: false, preview: false, error: e instanceof Error ? e.message : 'Unbekannter Fehler' }
  }
}
