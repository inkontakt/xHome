export type WordPressSiteKey = 'connectCarfit' | 'carfitMain' | 'carfitReviews'

type WordPressSiteConfig = {
  apiUrl?: string
  publicSiteUrl?: string
  authMode?: string
  username?: string
  appPassword?: string
}

function getOptionalEnv(name: string) {
  const value = import.meta.env[name]
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

function getRequiredValue(value: string | undefined, message: string) {
  if (!value) {
    throw new Error(message)
  }

  return value
}

const WORDPRESS_SITE_CONFIG: Record<WordPressSiteKey, WordPressSiteConfig> = {
  connectCarfit: {
    apiUrl: getOptionalEnv('WORDPRESS_API_URL'),
    publicSiteUrl: getOptionalEnv('WORDPRESS_PUBLIC_SITE_URL'),
    authMode: getOptionalEnv('WP_AUTH_MODE'),
    username: getOptionalEnv('WP_USERNAME'),
    appPassword: getOptionalEnv('WP_APP_PASSWORD')
  },
  carfitMain: {
    publicSiteUrl: getOptionalEnv('CARFIT_MAIN_PUBLIC_SITE_URL') ?? 'https://carfit-hamburg.de/'
  },
  carfitReviews: {
    apiUrl: getOptionalEnv('CARFIT_REVIEWS_WORDPRESS_API_URL'),
    publicSiteUrl: getOptionalEnv('CARFIT_REVIEWS_WORDPRESS_PUBLIC_SITE_URL'),
    authMode: getOptionalEnv('CARFIT_REVIEWS_WP_AUTH_MODE'),
    username: getOptionalEnv('CARFIT_REVIEWS_WP_USERNAME'),
    appPassword: getOptionalEnv('CARFIT_REVIEWS_WP_APP_PASSWORD')
  }
}

export function getWordPressSiteConfig(siteKey: WordPressSiteKey) {
  const siteConfig = WORDPRESS_SITE_CONFIG[siteKey]

  if (!siteConfig) {
    throw new Error(`Unknown WordPress site key: ${siteKey}`)
  }

  return siteConfig
}

export function getWordPressApiUrl(siteKey: WordPressSiteKey) {
  const siteConfig = getWordPressSiteConfig(siteKey)
  return getRequiredValue(
    siteConfig.apiUrl?.replace(/\/$/, ''),
    `Missing API URL for WordPress site: ${siteKey}`
  )
}

export function getWordPressPublicSiteUrl(siteKey: WordPressSiteKey) {
  const siteConfig = getWordPressSiteConfig(siteKey)
  return getRequiredValue(
    siteConfig.publicSiteUrl?.replace(/\/$/, ''),
    `Missing public site URL for WordPress site: ${siteKey}`
  )
}

export function getWordPressAuthCredentials(siteKey: WordPressSiteKey) {
  const siteConfig = getWordPressSiteConfig(siteKey)

  return {
    authMode: getRequiredValue(
      siteConfig.authMode,
      `Missing auth mode for WordPress site: ${siteKey}`
    ),
    username: getRequiredValue(
      siteConfig.username,
      `Missing username for WordPress site: ${siteKey}`
    ),
    appPassword: getRequiredValue(
      siteConfig.appPassword,
      `Missing app password for WordPress site: ${siteKey}`
    )
  }
}
