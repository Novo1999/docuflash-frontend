'use client'

import { Button, Drawer, Link } from '@heroui/react'
import { LuMenu } from 'react-icons/lu'
import { PricingTooltip } from '../landing/PricingTooltip'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

export function NavbarDrawer() {
  return (
    <Drawer>
      <Button variant="ghost" size="sm" slot="trigger" className="md:hidden p-2 text-[var(--ink-900)] hover:bg-black/5 min-w-0" aria-label="Open menu">
        <LuMenu className="w-5 h-5" />
      </Button>

      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog className="bg-white">
            <Drawer.CloseTrigger />

            <Drawer.Header className="pt-6 pb-2 px-6">
              <Drawer.Heading className="flex items-center">
                <Logo size="sm" href={null} />
              </Drawer.Heading>
            </Drawer.Header>

            <Drawer.Body className="px-6 py-4 flex flex-col gap-1">
              <Link
                href="#how-it-works"
                className="text-base text-[var(--ink-700)] no-underline hover:text-[var(--ink-900)] py-3 border-b border-black/[0.06] font-sans"
              >
                How it works
              </Link>
              <PricingTooltip className="text-base text-[var(--ink-700)] py-3 border-b border-black/[0.06] font-sans cursor-pointer hover:text-[var(--ink-900)] select-none block" />
              <Link
                href="/sign-in"
                className="text-base text-[var(--ink-700)] no-underline hover:text-[var(--ink-900)] py-3 border-b border-black/[0.06] font-sans"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="mt-3 bg-[var(--ink-900)] text-[var(--page)] rounded-xl px-4 h-11 inline-flex items-center justify-center text-sm font-medium no-underline hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>

              <div className="mt-6 pt-6 border-t border-[var(--border-soft)] flex items-center justify-between">
                <span className="text-xs text-[var(--ink-600)] font-sans uppercase tracking-wider">Theme</span>
                <ThemeToggle />
              </div>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )
}
