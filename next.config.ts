import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'
const basePath = isProd ? '/SpeedStars2.0' : ''

const config: NextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: { unoptimized: true },
}

export default config
