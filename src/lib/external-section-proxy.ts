const WORDPRESS_ROOT_PATH_PATTERN =
  /(["'=:(\s])\/(wp-admin\/|wp-content\/|wp-includes\/|wp-json(?:\/|[/?])|index\.php\?rest_route=)/g
const WORDPRESS_ESCAPED_ROOT_PATH_PATTERN =
  /\\\/(wp-admin\/|wp-content\/|wp-includes\/|wp-json(?:\/|[/?])|index\.php\?rest_route=)/g

import {
  getWordPressPublicSiteUrl,
  type WordPressSiteKey
} from '@/lib/wordpress-site-config'

export type ExternalSectionProxyConfig = {
  siteKey?: WordPressSiteKey
  sourceUrl: string
  sourcePath?: string
  templateId?: string | number
  sectionSelector?: string
}

export type ExternalSectionProxyContext = {
  remoteOrigin: string
  proxyBasePath: string
  sectionSelector?: string
  sourceUrl: string
  sourceDirectoryPath: string
}

function normalizeSourceUrl(sourceUrl: string) {
  return sourceUrl.trim()
}

function interpolateSourcePath(template: string, templateId?: string | number) {
  return template.replaceAll('{templateId}', String(templateId ?? '').trim())
}

function parseSelector(selector: string) {
  const normalized = selector.trim()

  const tagAndClassMatch = normalized.match(/^([a-z][\w:-]*)\.([\w-]+)$/i)
  if (tagAndClassMatch) {
    return {
      tagName: tagAndClassMatch[1]?.toLowerCase(),
      attrName: 'class',
      attrValue: tagAndClassMatch[2]
    }
  }

  const tagAndAttributeMatch = normalized.match(
    /^([a-z][\w:-]*)\[(.+?)=(?:"([^"]+)"|'([^']+)')\]$/i
  )
  if (tagAndAttributeMatch) {
    return {
      tagName: tagAndAttributeMatch[1]?.toLowerCase(),
      attrName: tagAndAttributeMatch[2]?.trim(),
      attrValue: tagAndAttributeMatch[3] ?? tagAndAttributeMatch[4] ?? ''
    }
  }

  const idMatch = normalized.match(/^#([\w-]+)$/)
  if (idMatch) {
    return {
      tagName: undefined,
      attrName: 'id',
      attrValue: idMatch[1]
    }
  }

  const classMatch = normalized.match(/^\.([\w-]+)$/)
  if (classMatch) {
    return {
      tagName: undefined,
      attrName: 'class',
      attrValue: classMatch[1]
    }
  }

  const attributeMatch = normalized.match(/^\[(.+?)=(?:"([^"]+)"|'([^']+)')\]$/)
  if (attributeMatch) {
    return {
      tagName: undefined,
      attrName: attributeMatch[1]?.trim(),
      attrValue: attributeMatch[2] ?? attributeMatch[3] ?? ''
    }
  }

  const tagMatch = normalized.match(/^([a-z][\w:-]*)$/i)
  if (tagMatch) {
    return {
      tagName: tagMatch[1]?.toLowerCase()
    }
  }

  return null
}

function readAttributeValue(attributes: string, attributeName: string) {
  const matcher = new RegExp(
    `${attributeName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    'i'
  )
  const match = attributes.match(matcher)

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? ''
}

function tagMatchesSelector(tagName: string, attributes: string, selector: string) {
  const parsedSelector = parseSelector(selector)

  if (!parsedSelector) {
    return false
  }

  if (parsedSelector.tagName && parsedSelector.tagName !== tagName.toLowerCase()) {
    return false
  }

  if (!parsedSelector.attrName) {
    return true
  }

  const attributeValue = readAttributeValue(attributes, parsedSelector.attrName)

  if (parsedSelector.attrName === 'class') {
    return attributeValue.split(/\s+/).includes(parsedSelector.attrValue ?? '')
  }

  return attributeValue === parsedSelector.attrValue
}

function findMatchingClosingTag(html: string, startIndex: number, tagName: string) {
  const tagPattern = new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'gi')
  tagPattern.lastIndex = startIndex

  let depth = 0
  let match: RegExpExecArray | null = null

  while ((match = tagPattern.exec(html))) {
    const token = match[0]
    const isClosingTag = token.startsWith('</')
    const isSelfClosing = token.endsWith('/>')

    if (!isClosingTag) {
      depth += 1

      if (isSelfClosing) {
        depth -= 1
      }
    } else {
      depth -= 1

      if (depth === 0) {
        return match.index + token.length
      }
    }
  }

  return -1
}

function extractBodyContent(html: string) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return bodyMatch?.[1] ?? html
}

function extractHeadContent(html: string) {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  return headMatch?.[1] ?? ''
}

function extractBodyScripts(bodyContent: string) {
  return Array.from(bodyContent.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi))
    .map(match => match[0])
    .join('\n')
}

export function extractConfiguredSection(html: string, selector?: string) {
  if (!selector?.trim()) {
    return html
  }

  const bodyContent = extractBodyContent(html)
  const tagPattern = /<([a-z][\w:-]*)\b([^>]*)>/gi
  let match: RegExpExecArray | null = null

  while ((match = tagPattern.exec(bodyContent))) {
    const tagName = match[1] ?? ''
    const attributes = match[2] ?? ''

    if (!tagMatchesSelector(tagName, attributes, selector)) {
      continue
    }

    const sectionEndIndex = findMatchingClosingTag(bodyContent, match.index, tagName)

    if (sectionEndIndex === -1) {
      break
    }

    const sectionHtml = bodyContent.slice(match.index, sectionEndIndex)
    const headContent = extractHeadContent(html)
    const bodyScripts = extractBodyScripts(bodyContent)

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    ${headContent}
  </head>
  <body>
    ${sectionHtml}
    ${bodyScripts}
  </body>
</html>`
  }

  return html
}

export function getExternalSectionProxyContext(
  config: ExternalSectionProxyConfig,
  proxyBasePath: string
): ExternalSectionProxyContext {
  const baseSiteUrl = config.siteKey ? getWordPressPublicSiteUrl(config.siteKey) : ''
  const sourcePath = config.sourcePath
    ? interpolateSourcePath(config.sourcePath, config.templateId)
    : ''
  const resolvedSourceUrl =
    config.sourceUrl ||
    (baseSiteUrl && sourcePath ? new URL(sourcePath, `${baseSiteUrl}/`).toString() : '') ||
    baseSiteUrl
  const sourceUrl = normalizeSourceUrl(resolvedSourceUrl)

  if (!sourceUrl) {
    throw new Error('Missing external section proxy source URL')
  }

  const parsedSourceUrl = new URL(sourceUrl)
  const pathname = parsedSourceUrl.pathname || '/'
  const sourceDirectoryPath = pathname.endsWith('/')
    ? pathname
    : pathname.replace(/[^/]*$/, '')

  return {
    remoteOrigin: parsedSourceUrl.origin,
    proxyBasePath,
    sectionSelector: config.sectionSelector,
    sourceUrl: parsedSourceUrl.toString(),
    sourceDirectoryPath
  }
}

export function buildExternalSectionProxyUrl(
  proxyBasePath: string,
  sourceDirectoryPath = '/'
) {
  const normalizedDirectory = sourceDirectoryPath.replace(/^\/+/, '')
  return normalizedDirectory ? `${proxyBasePath}/${normalizedDirectory}` : `${proxyBasePath}/`
}

function rewriteCommonProxyText(
  source: string,
  context: ExternalSectionProxyContext,
  localOrigin: string
) {
  const proxyBaseUrl = `${localOrigin}${context.proxyBasePath}`
  const escapedRemoteOrigin = context.remoteOrigin.replaceAll('/', '\\/')
  const escapedProxyBaseUrl = proxyBaseUrl.replaceAll('/', '\\/')
  const escapedProxyBasePath = context.proxyBasePath.replaceAll('/', '\\/')

  let output = source.replaceAll(context.remoteOrigin, proxyBaseUrl)
  output = output.replaceAll(escapedRemoteOrigin, escapedProxyBaseUrl)

  output = output.replace(WORDPRESS_ROOT_PATH_PATTERN, `$1${context.proxyBasePath}/$2`)
  output = output.replace(
    WORDPRESS_ESCAPED_ROOT_PATH_PATTERN,
    `${escapedProxyBasePath}\\/$1`
  )

  return output
}

export function rewriteExternalProxyHtml(
  html: string,
  context: ExternalSectionProxyContext,
  localOrigin: string
) {
  let output = rewriteCommonProxyText(html, context, localOrigin)
  output = output.replace(
    /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi,
    ''
  )
  output = output.replace(/<meta[^>]+http-equiv=["']X-Frame-Options["'][^>]*>/gi, '')

  if (/<head[^>]*>/i.test(output)) {
    const baseHref = `${localOrigin}${buildExternalSectionProxyUrl(
      context.proxyBasePath,
      context.sourceDirectoryPath
    )}`

    output = output.replace(/<head[^>]*>/i, match => `${match}\n<base href="${baseHref}">`)
  }

  return output
}

export function rewriteExternalProxyTextAsset(
  assetText: string,
  context: ExternalSectionProxyContext,
  localOrigin: string
) {
  return rewriteCommonProxyText(assetText, context, localOrigin)
}

function buildProxyUrlForUpstreamUrl(
  upstreamUrl: URL,
  context: ExternalSectionProxyContext,
  localOrigin: string
) {
  const upstreamPath = upstreamUrl.pathname.replace(/^\/+/, '')
  const proxyPath = upstreamPath
    ? `${context.proxyBasePath}/${upstreamPath}`
    : `${context.proxyBasePath}/`

  return `${localOrigin}${proxyPath}${upstreamUrl.search}${upstreamUrl.hash}`
}

export function rewriteExternalProxyLocationHeader(
  location: string,
  context: ExternalSectionProxyContext,
  localOrigin: string
) {
  try {
    const upstreamUrl = new URL(location, context.sourceUrl)

    if (upstreamUrl.origin === context.remoteOrigin) {
      return buildProxyUrlForUpstreamUrl(upstreamUrl, context, localOrigin)
    }
  } catch {
    return location
  }

  return location
}

export function resolveExternalProxyAssetUrl(
  requestedPath: string,
  context: ExternalSectionProxyContext
) {
  const trimmedPath = requestedPath.replace(/^\/+/, '')

  if (/^(wp-admin|wp-content|wp-includes|wp-json)\//.test(trimmedPath)) {
    return new URL(`/${trimmedPath}`, context.remoteOrigin)
  }

  return new URL(trimmedPath, context.sourceUrl)
}

export function isTextLikeContentType(contentType: string | null) {
  if (!contentType) {
    return false
  }

  return (
    contentType.includes('text/html') ||
    contentType.includes('text/css') ||
    contentType.includes('text/plain') ||
    contentType.includes('javascript') ||
    contentType.includes('application/x-javascript') ||
    contentType.includes('application/json')
  )
}
