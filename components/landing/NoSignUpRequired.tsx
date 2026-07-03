'use client'
import { useAuth } from '@/components/auth/useAuth'
import { LuShield } from 'react-icons/lu'

const NoSignUpRequired = () => {
  const { user, isAuthenticated } = useAuth()

  console.log({ user, isAuthenticated })


  if( isAuthenticated && user?.id) {
    return null
  }
  
  return (
    <div className="flex items-center gap-1 bg-[var(--brand-alpha-12)] border border-[var(--brand-alpha-30)] px-3 py-1.5 rounded-full">
      <LuShield className="text-[var(--brand-400)] w-3 h-3" />
      <span className="text-xs font-medium text-[var(--brand-400)]">No sign-up required</span>
    </div>
  )
}
export default NoSignUpRequired
