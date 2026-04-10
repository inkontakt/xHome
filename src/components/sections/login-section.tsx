import AuthFormSection from '@/components/auth/auth-form-section'
import AuthPromoSection from '@/components/auth/auth-promo-section'
import LoginForm from '@/components/auth/login-form'

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

const LoginPage = () => {
  return (
    <div className='px-8 md:px-16 lg:px-24'>
      <div className='mx-auto h-dvh max-w-7xl border-x lg:grid lg:grid-cols-2'>
        <AuthFormSection
          title='Welcome Back'
          subtitle='Welcome back! Select method to login:'
          showSocialButtons
          socialButtons={{ google: true, facebook: true }}
          showDivider
          dividerText='or Continue with Email'
          footerText='New on our platform?'
          footerLinkText='Create an account'
          footerLinkHref='/register'
        >
          <LoginForm />
        </AuthFormSection>

        <AuthPromoSection
          title='Welcome back! Please sign in to your Shadcn Studio account'
          description='Thank you for registering! Please check your inbox and click the verification link to activate your account.'
          cardTitle='Please enter your login details'
          cardDescription='Stay connected with Shadcn Studio Subscribe now for the latest updates and news.'
          avatars={avatars}
        />
      </div>
    </div>
  )
}

export default LoginPage
