'use client'

import { useState } from 'react'

import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PrimaryOrionButton } from '@/components/ui/orion-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SetNewPasswordForm = () => {
  const [isVisibleNew, setIsVisibleNew] = useState(false)
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = '/'
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      {/* New Password */}
      <div className='w-full space-y-1'>
        <Label className='leading-5' htmlFor='newPassword'>
          New password*
        </Label>
        <div className='relative'>
          <Input
            id='newPassword'
            type={isVisibleNew ? 'text' : 'password'}
            placeholder='••••••••••••••••'
            className='pr-9'
            required
            minLength={8}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => setIsVisibleNew(prevState => !prevState)}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
          >
            {isVisibleNew ? <EyeOffIcon /> : <EyeIcon />}
            <span className='sr-only'>{isVisibleNew ? 'Hide password' : 'Show password'}</span>
          </Button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className='w-full space-y-1'>
        <Label className='leading-5' htmlFor='confirmPassword'>
          Confirm password*
        </Label>
        <div className='relative'>
          <Input
            id='confirmPassword'
            type={isVisibleConfirm ? 'text' : 'password'}
            placeholder='••••••••••••••••'
            className='pr-9'
            required
            minLength={8}
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => setIsVisibleConfirm(prevState => !prevState)}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
          >
            {isVisibleConfirm ? <EyeOffIcon /> : <EyeIcon />}
            <span className='sr-only'>{isVisibleConfirm ? 'Hide password' : 'Show password'}</span>
          </Button>
        </div>
      </div>

      <PrimaryOrionButton size='lg' className='w-full' type='submit'>
        Save changes
      </PrimaryOrionButton>
    </form>
  )
}

export default SetNewPasswordForm
