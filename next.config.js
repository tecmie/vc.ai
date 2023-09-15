/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**',
      },
    ],
  },
    /**
   * Lance DB, namespaced as vectordb's node binding (index.node) needs a plugin to be parsed by webpack when bundling.
   * You can either use that or simply ignore that file.
   *
   * @see https://github.com/lancedb/lancedb/issues/448
   *
   * @see https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config
   */
     webpack(config) {
      config.externals.push({ vectordb: 'vectordb' });
      return config;
    },
};
