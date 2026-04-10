import AuthFormSection from '@/components/auth/auth-form-section'
import AuthPromoSection from '@/components/auth/auth-promo-section'
import RegisterForm from '@/components/auth/register-form'

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

const RegisterPage = () => {
  return (
    <div className='px-8 md:px-16 lg:px-24'>
      <div className='mx-auto h-dvh max-w-7xl border-x lg:grid lg:grid-cols-2'>
        <AuthFormSection
          title='Create your account'
          subtitle="Let's get started with your personal AI agent—designed to take care of your everyday tasks effortlessly."
          showSocialButtons
          socialButtons={{ google: true }}
          showDivider
          dividerText='or'
          footerText='Already have an account?'
          footerLinkText='Log in'
          footerLinkHref='/login'
        >
          <RegisterForm />
        </AuthFormSection>

        <AuthPromoSection
          title='Create your account to get started.'
          description='Your account gives you access to your personalised AI agent allowing you to automate simple tasks, organise your daily routines, and stay seamlessly connected across all your devices.'
          cardTitle='Create your account to get started.'
          cardDescription='Your account gives you access to your personalised AI agent allowing you to automate simple tasks.'
          avatars={avatars}
        />
      </div>
    </div>
  )
}

export default RegisterPage
