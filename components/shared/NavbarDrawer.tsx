'use client'

import { Button, Drawer, Link } from '@heroui/react'
import { LuFileText, LuMenu } from 'react-icons/lu'

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
              <Drawer.Heading className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[var(--ink-900)] rounded-lg flex items-center justify-center">
                  <LuFileText className="text-[var(--brand-400)] text-sm" />
                </div>
                <span className="text-[17px] font-medium text-[var(--ink-900)] tracking-tight font-sans">Docuflash</span>
              </Drawer.Heading>
            </Drawer.Header>

            <Drawer.Body className="px-6 py-4 flex flex-col gap-1">
              <Link href="#" className="text-base text-[var(--ink-700)] no-underline hover:text-[var(--ink-900)] py-3 border-b border-black/[0.06] font-sans">
                How it works
              </Link>
              <Link href="#" className="text-base text-[var(--ink-700)] no-underline hover:text-[var(--ink-900)] py-3 font-sans">
                Pricing
              </Link>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )
}
