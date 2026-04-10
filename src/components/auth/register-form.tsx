'use client'

import { useState } from 'react'

import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PrimaryOrionButton } from '@/components/ui/orion-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const RegisterForm = () => {
  const [isVisible, setIsVisible] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = '/'
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      {/* Name */}
      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='userName'>
          Name*
        </Label>
        <Input type='text' id='userName' placeholder='Enter your name' required />
      </div>

      {/* Email */}
      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='userEmail'>
          Email address*
        </Label>
        <Input type='email' id='userEmail' placeholder='Enter your email address' required />
      </div>

      {/* Password */}
      <div className='w-full space-y-1'>
        <Label className='leading-5' htmlFor='password'>
          Password*
        </Label>
        <div className='relative'>
          <Input
            id='password'
            type={isVisible ? 'text' : 'password'}
            placeholder='••••••••••••••••'
            className='pr-9'
            required
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => setIsVisible(prevState => !prevState)}
            className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
          >
            {isVisible ? <EyeOffIcon /> : <EyeIcon />}
            <span className='sr-only'>{isVisible ? 'Hide password' : 'Show password'}</span>
          </Button>
        </div>
      </div>

      {/* Terms and Privacy */}
      <div className='flex gap-3'>
        <Checkbox id='terms' className='size-6' required />
        <Label htmlFor='terms' className='text-sm'>
          I agree to all Term, privacy Policy and Fees
        </Label>
      </div>

      <PrimaryOrionButton size='lg' className='w-full' type='submit'>
        Sign up to Orion
      </PrimaryOrionButton>
    </form>
  )
}

export default RegisterForm
