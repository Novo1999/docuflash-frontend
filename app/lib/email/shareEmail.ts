import { EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID } from '@/app/constants/email'
import emailjs from '@emailjs/browser'

export type ShareEmailParams = {
  toEmail: string
  resourceName: string
  resourceType: 'file' | 'folder'
  shareLink: string
  isProtected: boolean
  senderName?: string
  message?: string
}

// Variables here must match the placeholders used in the EmailJS template
// (see docs/share-to-email-setup.md). `to_email` is wired to the template's "To" field.
export async function sendShareEmail(params: ShareEmailParams): Promise<void> {
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    throw new Error('Email sharing is not configured.')
  }

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      to_email: params.toEmail,
      from_name: params.senderName?.trim() || 'A Docuflash user',
      resource_name: params.resourceName,
      resource_type: params.resourceType,
      share_link: params.shareLink,
      is_protected: params.isProtected ? 'Yes' : 'No',
      protected_note: params.isProtected ? `🔒 This ${params.resourceType} is password protected — ask the sender for the password to open it.` : '',
      message: params.message?.trim() || '',
    },
    { publicKey: EMAILJS_PUBLIC_KEY },
  )
}
