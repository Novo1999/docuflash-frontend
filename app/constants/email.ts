// EmailJS is a client-side service; these keys are public by design and injected at build time.
// Configure them on the EmailJS dashboard (Email Services + Email Template) and add to your env.
export const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
export const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
export const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

// The "Share to Email" UI is only surfaced when all three keys are present.
export const isEmailShareConfigured = Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY)
