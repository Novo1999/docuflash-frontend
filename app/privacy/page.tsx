import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Novodip and Docuflash collect, use, share, and delete information.',
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-2xl font-serif text-[var(--ink-900)]">{title}</h2>
    <div className="space-y-3 text-[var(--ink-600)] leading-7">{children}</div>
  </section>
)

export default function PrivacyPage() {
  return (
    <main className="flex-1 px-6 py-12 sm:py-20 font-sans">
      <article className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3 border-b border-line pb-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--brand-400)]">Docuflash</p>
          <h1 className="text-4xl sm:text-5xl font-serif text-[var(--ink-900)]">Privacy Policy</h1>
          <p className="text-sm text-[var(--ink-600)]">Effective date: September 18, 2026</p>
        </header>

        <Section title="Who we are">
          <p>Docuflash is operated by Novodip ("Novodip", "we", "us", or "our"). This policy explains how we handle information when you use the Docuflash website and mobile app.</p>
          <p>For privacy questions, contact us at <a className="text-[var(--brand-400)] hover:underline" href="mailto:novorony52@gmail.com">novorony52@gmail.com</a>.</p>
        </Section>

        <Section title="Information we handle">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="text-[var(--ink-900)]">Account and profile information:</strong> your email address, display name, profile image, account identifier, authentication provider, and account preferences.</li>
            <li><strong className="text-[var(--ink-900)]">Documents and sharing information:</strong> files you upload; file names, types, sizes, share links, expiry choices, access settings, file requests, folders, and notes.</li>
            <li><strong className="text-[var(--ink-900)]">Authentication information:</strong> information needed to authenticate you, including email/password authentication and identity information provided through Google or GitHub sign-in when you choose those options.</li>
            <li><strong className="text-[var(--ink-900)]">Technical information:</strong> app or browser state, an anonymous client identifier, and device information supplied with uploads to operate and protect the service.</li>
            <li><strong className="text-[var(--ink-900)]">Deletion requests:</strong> the email address used to request account deletion and the verified session used to complete it.</li>
          </ul>
        </Section>

        <Section title="How we use information">
          <p>We use this information to create and secure accounts, upload and share documents, provide file requests and previews, apply passwords and expiry settings, respond to support or deletion requests, prevent misuse, and maintain the service.</p>
          <p>A public link may be opened by anyone who receives it. A password-protected link requires the password chosen by its sender. Do not share links or passwords with people you do not intend to access a document.</p>
        </Section>

        <Section title="Service providers">
          <p>We use service providers to operate Docuflash. These include Supabase for authentication and realtime service features, UploadThing for file-upload and storage services, and hosting providers for the website and API. They process information only to provide their services to us.</p>
          <p>We may disclose information when required by law or when reasonably necessary to protect users, Novodip, or the service from fraud, abuse, or security threats.</p>
        </Section>

        <Section title="Retention and deletion">
          <p>Files and links are available only under the access and expiration settings selected for them. When you request account deletion, we delete the account and its associated profile information, documents, file metadata, share links, folders, file requests, notes, avatar, and authentication identity within 14 days. The deletion cannot be undone.</p>
          <p>We do not retain account or document data after that deletion is completed. Anonymous uploads that were not associated with an account are governed by their own expiry setting and cannot be located by an account-deletion request.</p>
          <p>You can begin a signed-out, email-verified deletion request at <Link className="text-[var(--brand-400)] hover:underline" href="/delete-account">Delete your Docuflash account</Link>. You can also delete an authenticated account from Profile in the mobile app or contact <a className="text-[var(--brand-400)] hover:underline" href="mailto:novorony52@gmail.com">novorony52@gmail.com</a>.</p>
        </Section>

        <Section title="Security">
          <p>We use reasonable technical and organizational safeguards designed to protect Docuflash information. No internet service can guarantee absolute security, so use strong unique credentials and share documents only with intended recipients.</p>
        </Section>

        <Section title="Your choices and questions">
          <p>You may update account details in the app, delete individual content where the feature is available, or request account deletion. To ask about access to, correction of, or deletion of your information, email <a className="text-[var(--brand-400)] hover:underline" href="mailto:novorony52@gmail.com">novorony52@gmail.com</a>.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>We may update this policy when Docuflash or applicable requirements change. We will post the updated version here and revise the effective date.</p>
        </Section>
      </article>
    </main>
  )
}
