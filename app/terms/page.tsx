import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'The rules for using Docuflash, including prohibited content and how Novodip enforces them.',
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-2xl font-serif text-[var(--ink-900)]">{title}</h2>
    <div className="space-y-3 text-[var(--ink-600)] leading-7">{children}</div>
  </section>
)

export default function TermsPage() {
  return (
    <main className="flex-1 px-6 py-12 sm:py-20 font-sans">
      <article className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3 border-b border-line pb-8">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--brand-400)]">Docuflash</p>
          <h1 className="text-4xl sm:text-5xl font-serif text-[var(--ink-900)]">Terms of Use</h1>
          <p className="text-sm text-[var(--ink-600)]">Effective date: September 18, 2026</p>
        </header>

        <Section title="Accepting these terms">
          <p>Docuflash is operated by Novodip (&quot;Novodip&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By creating an account, uploading a file, or sending a file through a Docuflash link, you agree to these Terms of Use and to our <Link className="text-[var(--brand-400)] hover:underline" href="/privacy">Privacy Policy</Link>.</p>
          <p>If you do not agree, do not upload content to Docuflash. You must be old enough to form a binding contract where you live.</p>
        </Section>

        <Section title="What Docuflash does">
          <p>Docuflash lets you upload documents and create links that other people can open. A link may be public, meaning anyone who receives it can open it, or password-protected, meaning the recipient also needs the password you chose. Links expire according to the setting chosen when they were created.</p>
          <p>You can also create a file request, which lets other people upload files to you without a Docuflash account.</p>
          <p>Anyone holding a link can forward it. Do not use Docuflash to distribute anything you would not want a recipient to pass on.</p>
        </Section>

        <Section title="Content you are responsible for">
          <p>You are responsible for everything you upload, share, or request through Docuflash, and for having the right to share it. We do not claim ownership of your files.</p>
        </Section>

        <Section title="Prohibited content and behavior">
          <p>You may not upload, share, request, or link to any of the following through Docuflash:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong className="text-[var(--ink-900)]">Child sexual abuse material</strong>, or any content that sexualizes a minor. We report this content to the appropriate authorities.</li>
            <li><strong className="text-[var(--ink-900)]">Non-consensual intimate imagery</strong>, or any sexual content shared without the consent of the people depicted.</li>
            <li><strong className="text-[var(--ink-900)]">Illegal content</strong>, including content that facilitates a crime, or that you are legally barred from possessing or distributing.</li>
            <li><strong className="text-[var(--ink-900)]">Malware</strong>, including viruses, ransomware, spyware, exploit code, and files designed to compromise a recipient&apos;s device or accounts.</li>
            <li><strong className="text-[var(--ink-900)]">Harassment, threats, hate speech, or content that incites violence</strong> against a person or group.</li>
            <li><strong className="text-[var(--ink-900)]">Content that infringes</strong> someone else&apos;s copyright, trademark, trade secret, privacy, or other rights.</li>
            <li><strong className="text-[var(--ink-900)]">Spam, phishing, or fraud</strong>, including links or documents designed to deceive a recipient into giving up credentials, payment details, or personal information.</li>
            <li><strong className="text-[var(--ink-900)]">Other people&apos;s personal or confidential information</strong> shared without a lawful basis to do so.</li>
          </ul>
          <p>You also may not attempt to break, overload, or bypass the access controls of Docuflash, access files or links that were not shared with you, or use Docuflash to send unsolicited bulk content.</p>
        </Section>

        <Section title="Reporting abuse">
          <p>Every share link and folder link has a <strong className="text-[var(--ink-900)]">Report</strong> control, and you do not need a Docuflash account to use it. If you receive a Docuflash link containing content that breaks these rules, please report it.</p>
          <p>You can also email <a className="text-[var(--brand-400)] hover:underline" href="mailto:novorony52@gmail.com">novorony52@gmail.com</a> with the link and a description of the problem. We review every report we receive.</p>
          <p>If you believe content infringes your copyright, email the same address with the link, a description of the work, and a statement that you are the rights holder or authorized to act for them.</p>
        </Section>

        <Section title="Blocking senders">
          <p>If you created a file request and someone uploads content you did not want, you can block that sender from your file request. A blocked sender can no longer upload to that link. You can also delete the link at any time, which immediately stops anyone from reaching the content behind it.</p>
        </Section>

        <Section title="How we enforce these terms">
          <p>We review reports of prohibited content. Depending on what we find, we may remove the content, disable the link, block a sender, suspend or terminate the account responsible, and report the matter to law enforcement where the law requires or permits it.</p>
          <p>We may act without prior notice when content appears to present an immediate risk of harm. Where we remove content or terminate an account, we will tell the account holder the reason unless doing so is unlawful or would create a risk of harm.</p>
          <p>If you believe we made a mistake, reply to our message or email <a className="text-[var(--brand-400)] hover:underline" href="mailto:novorony52@gmail.com">novorony52@gmail.com</a> and we will review the decision.</p>
        </Section>

        <Section title="Your account">
          <p>Keep your credentials secure and do not let anyone else use your account. Tell us promptly if you believe your account has been accessed without your permission.</p>
          <p>You can delete your account at any time from Profile in the mobile app, or through the signed-out request at <Link className="text-[var(--brand-400)] hover:underline" href="/delete-account">Delete your Docuflash account</Link>.</p>
        </Section>

        <Section title="Service availability and disclaimers">
          <p>Docuflash is provided as is. We do not guarantee that the service will be uninterrupted, that a link will remain available, or that a file will be recoverable. Keep your own copy of anything important. To the extent permitted by law, Novodip is not liable for indirect or consequential losses arising from your use of Docuflash.</p>
          <p>We may change, suspend, or discontinue features, and we may stop providing the service to you if you break these terms.</p>
        </Section>

        <Section title="Changes to these terms">
          <p>We may update these terms when Docuflash or applicable requirements change. We will post the updated version here and revise the effective date. If a change is material, we will ask you to accept the updated terms in the app before you upload again.</p>
        </Section>

        <Section title="Contact">
          <p>Questions about these terms, and all abuse reports, can be sent to <a className="text-[var(--brand-400)] hover:underline" href="mailto:novorony52@gmail.com">novorony52@gmail.com</a>.</p>
        </Section>
      </article>
    </main>
  )
}
