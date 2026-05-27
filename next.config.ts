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
    ]
  },
}

export default nextConfig
