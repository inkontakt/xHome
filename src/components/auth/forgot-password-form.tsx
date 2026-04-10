'use client'

import { PrimaryOrionButton } from '@/components/ui/orion-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ForgotPasswordForm = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = '/set-new-password'
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      {/* Email */}
      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='userEmail'>
          Email address*
        </Label>
        <Input type='email' id='userEmail' placeholder='Enter your email address' required />
      </div>

      <PrimaryOrionButton size='lg' className='w-full' type='submit'>
        Reset password
      </PrimaryOrionButton>
    </form>
  )
}

export default ForgotPasswordForm
