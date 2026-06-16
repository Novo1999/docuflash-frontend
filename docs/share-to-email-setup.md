# Share to Email (EmailJS) — setup

The "Share via email" feature sends the share link straight to recipients from the browser using
[EmailJS](https://www.emailjs.com/). No backend route is involved.

The UI only appears once all three env vars below are set — until then the mail buttons are hidden
(`isEmailShareConfigured` in [`app/constants/email.ts`](../app/constants/email.ts)).

## 1. Create the EmailJS pieces

1. Sign up at emailjs.com and add an **Email Service** (Gmail, Outlook, custom SMTP, …). Copy its **Service ID**.
2. Create an **Email Template** and copy its **Template ID**.
3. From **Account → General**, copy your **Public Key**.

## 2. Configure the template

In the EmailJS template editor:

- **Settings tab → "To Email"**: set it to `{{to_email}}` (this is how each recipient is addressed).
- **Settings tab → Subject**: `{{from_name}} shared a {{resource_type}} with you on Docuflash`
- **Content → Edit Content → `<>` (Code) view**: paste the full contents of
  [`docs/emailjs-share-template.html`](./emailjs-share-template.html).

The template uses these variables, all sent by [`app/lib/email/shareEmail.ts`](../app/lib/email/shareEmail.ts):

| Variable            | Meaning                                                        |
| ------------------- | -------------------------------------------------------------- |
| `{{to_email}}`      | Recipient address (wire to the template's **To** field)        |
| `{{from_name}}`     | Sender's name (defaults to "A Docuflash user")                 |
| `{{resource_name}}` | File or folder name                                            |
| `{{resource_type}}` | `file` or `folder`                                             |
| `{{share_link}}`    | The share URL                                                  |
| `{{protected_note}}`| Sentence shown only for password-protected items (else empty)  |
| `{{message}}`       | Optional personal note (else empty)                            |

> EmailJS only does flat `{{variable}}` substitution — it does **not** support Handlebars block helpers
> (`{{#if}}` / `{{/if}}`), which throw "One or more dynamic variables are corrupted". The template avoids them:
> the optional `message` and `protected_note` values are empty strings when not applicable, so those lines just
> render nothing.

## 3. Add environment variables

Add to `.env.local` (and to your Vercel project env). They are public by design (`NEXT_PUBLIC_`):

```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```

Restart `npm run dev` after adding them (env is inlined at build time).

## 4. Try it

The "Share via email" entry points appear in:

- The **upload success** screen ([`UploadForm`](../components/landing/UploadForm.tsx)) — one-click share right after uploading.
- The mail icon on each card in **Currently uploaded** ([`RecentUploads`](../components/landing/RecentUploads.tsx)) and **My Uploads** ([`MyUploads`](../components/me/MyUploads.tsx)), for files and folders.

All of them open [`ShareToEmailModal`](../components/share/ShareToEmailModal.tsx): add one or more recipients
(Enter or comma to add a chip), an optional name and message, then send. Multiple recipients are sent in
parallel and partial failures are reported.

## Notes & limits

- EmailJS free tier is rate-limited (200 emails/month at time of writing) — fine for personal use, plan
  accordingly for higher volume.
- The public key is exposed in the browser bundle. That's expected for EmailJS; lock down abuse via EmailJS's
  allowed-origins / reCAPTCHA settings in the dashboard if needed.
