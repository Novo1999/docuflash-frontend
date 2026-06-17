'use client'

import AuthButton from '@/components/auth/AuthButton'
import MobileProfileHeader from '@/components/auth/MobileProfileHeader'
import { navDrawerOpenAtom } from '@/components/shared/atoms/navAtom'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { Button, Drawer, Link, useOverlayState } from '@heroui/react'
import { useAtom } from 'jotai'
import { LuFileText, LuMenu } from 'react-icons/lu'
import PricingTooltip from '../landing/PricingTooltip'

const NavbarDrawer = () => {
  const [isOpen, setOpen] = useAtom(navDrawerOpenAtom)
  const drawer = useOverlayState({ isOpen, onOpenChange: setOpen })

  return (
    <Drawer state={drawer}>
      <Button variant="ghost" size="sm" slot="trigger" className="md:hidden p-2 text-[var(--ink-900)] hover:bg-ink-900/5 min-w-0" aria-label="Open menu">
        <LuMenu className="w-5 h-5" />
      </Button>

      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog className="bg-surface">
            {({ close }) => (
              <>
                <Drawer.CloseTrigger />

                <Drawer.Header className="pt-6 pb-2 px-6">
                  <Drawer.Heading className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[var(--ink-900)] rounded-lg flex items-center justify-center">
                      <LuFileText className="text-[var(--brand-400)] text-sm" />
                    </div>
                    <span className="text-[17px] font-medium text-[var(--ink-900)] tracking-tight font-sans">Docuflash</span>
                  </Drawer.Heading>
                </Drawer.Header>

                <MobileProfileHeader onNavigate={close} />

                <Drawer.Body className="px-6 py-4 flex flex-col gap-1">
                  <Link href="#how-it-works" onClick={close} className="text-base text-[var(--ink-700)] no-underline hover:text-[var(--ink-900)] py-3 border-b border-line font-sans">
                    How it works
                  </Link>
                  <PricingTooltip className="text-base text-[var(--ink-700)] py-3 font-sans cursor-pointer hover:text-[var(--ink-900)] select-none block" />
                  <div className="flex items-center justify-between py-3 border-b border-line">
                    <span className="text-base text-[var(--ink-700)] font-sans">Appearance</span>
                    <ThemeToggle />
                  </div>
                  <div className="pt-4">
                    <AuthButton isMobile onNavigate={close} />
                  </div>
                </Drawer.Body>
              </>
            )}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )
}

export default NavbarDrawer
