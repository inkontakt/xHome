'use client'

import { useState } from 'react'

import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PrimaryOrionButton } from '@/components/ui/orion-button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const LoginForm = () => {
  const [isVisible, setIsVisible] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = '/'
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

      {/* Remember Me & Forgot Password */}
      <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-4'>
        <div className='flex items-center gap-3'>
          <Checkbox id='remember' className='size-6' required />
          <Label htmlFor='remember'>Remember Me</Label>
        </div>
        <a href='/forgot-password' className='text-foreground hover:underline'>
          Forgot Password?
        </a>
      </div>

      <PrimaryOrionButton size='lg' className='w-full' type='submit'>
        Sign in to Orion
      </PrimaryOrionButton>
    </form>
  )
}

export default LoginForm
