import AuthFormSection from '@/components/auth/auth-form-section'
import AuthPromoSection from '@/components/auth/auth-promo-section'
import ForgotPasswordForm from '@/components/auth/forgot-password-form'

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

const ForgotPasswordPage = () => {
  return (
    <div className='px-8 md:px-16 lg:px-24'>
      <div className='mx-auto h-dvh max-w-7xl border-x lg:grid lg:grid-cols-2'>
        <AuthFormSection
          title='Forgot Password?'
          subtitle="No worries, we'll send you reset instructions"
          footerLinkText='Back to Sign in'
          footerLinkHref='/login'
        >
          <ForgotPasswordForm />
        </AuthFormSection>

        <AuthPromoSection
          title="Don't worry it happens! Resetting your password is quick and easy."
          description="Just enter your registered email address below, and we'll send you a secure link to reset your password. Follow the instructions in the email, and you'll be back in your account in no time!"
          cardTitle='Follow the instructions'
          cardDescription="If you don't see the email in your inbox, be sure to check your spam or junk folder."
          avatars={avatars}
        />
      </div>
    </div>
  )
}

export default ForgotPasswordPage
