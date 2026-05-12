import type { MetadataRoute } from 'next'

const siteUrl = 'https://docuflash-frontend.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/files/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
