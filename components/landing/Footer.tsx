import { Button, Link } from '@heroui/react'
import { LuGithub } from 'react-icons/lu'

export default async function Footer() {
  return (
    <footer className="border-t border-black/5 bg-[var(--brand-50)] px-10 py-5 flex items-center justify-between">
      <span className="text-sm text-[var(--ink-600)] font-[var(--font-dm-sans)]">
        © {new Date().getFullYear()} Docuflash Inc.
      </span>

      <div className="flex items-center gap-6">
        {['Privacy', 'Terms'].map((l) => (
          <Link key={l} href="#" className="text-sm text-[var(--ink-600)] no-underline hover:text-[var(--ink-900)]">
            {l}
          </Link>
        ))}
        <Button
          isIconOnly
          variant="primary"
          aria-label="GitHub"
          size="sm"
          className="text-[var(--ink-600)]"
        >
          <LuGithub />
        </Button>
      </div>
    </footer>
  )
}
