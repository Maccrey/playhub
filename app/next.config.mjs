process.env.TAILWIND_DISABLE_OXIDE ??= '1';

import withNextIntl from 'next-intl/plugin';

const withNextIntlPlugin = withNextIntl();

const normalizeBasePath = (value) => {
  if (!value) return '';
  const trimmed = value.replace(/\/+$/, '');
  if (!trimmed || trimmed === '/') return '';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const repository = process.env.GITHUB_REPOSITORY?.split('/') ?? [];
const repoName = repository[1];
const isGithubPages = process.env.GITHUB_PAGES === 'true';
const isUserOrOrgPage = repoName ? repoName.toLowerCase().endsWith('.github.io') : false;
const explicitBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.BASE_PATH;
const inferredBasePath = isGithubPages && repoName && !isUserOrOrgPage ? `/${repoName}` : '';
const basePath = normalizeBasePath(explicitBasePath ?? inferredBasePath);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    // Allow Next.js to build on CI even if lint warnings exist; we track fixes separately.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checks during the static export build on CI.
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default withNextIntlPlugin(nextConfig);
