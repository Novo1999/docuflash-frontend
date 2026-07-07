import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Link',
            value: '<https://uploadthing.com>; rel=preconnect',
          },
        ],
      },
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ]
  },
}

export default nextConfig
