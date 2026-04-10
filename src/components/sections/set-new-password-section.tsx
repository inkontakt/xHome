import AuthFormSection from '@/components/auth/auth-form-section'
import AuthPromoSection from '@/components/auth/auth-promo-section'
import SetNewPasswordForm from '@/components/auth/set-new-password-form'

const avatars = [
  {
    src: '/images/avatar/9.webp',
    fallback: 'OS',
    name: 'Olivia Sparks'
  },
  {
    src: '/images/avatar/10.webp',
    fallback: 'HL',
    name: 'Howard Lloyd'
  },
  {
    src: '/images/avatar/8.webp',
    fallback: 'HR',
    name: 'Hallie Richards'
  }
]

const SetNewPasswordPage = () => {
  return (
    <div className='px-8 md:px-16 lg:px-24'>
      <div className='mx-auto h-dvh max-w-7xl border-x lg:grid lg:grid-cols-2'>
        <AuthFormSection
          title='Set new password'
          subtitle='Must be at least 8 characters.'
          footerLinkText='Back to Sign in'
          footerLinkHref='/login'
        >
          <SetNewPasswordForm />
        </AuthFormSection>

        <AuthPromoSection
          title="You're just one step away from regaining access to your account."
          description="Please create a new password below. Make sure it's strong and secure, combining letters, numbers, and special characters."
          cardTitle='Reset Your Password'
          cardDescription="You're just one step away from regaining access to your account."
          avatars={avatars}
        />
      </div>
    </div>
  )
}

export default SetNewPasswordPage
