import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const config: NextConfig = {
  transpilePackages: ['@round9/shared'],
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
};

export default createNextIntlPlugin('./i18n/request.ts')(config);
