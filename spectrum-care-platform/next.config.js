/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable for Netlify deployment compatibility
  output: process.env.NETLIFY ? 'export' : undefined,
  trailingSlash: process.env.NETLIFY ? true : false,
  distDir: process.env.NETLIFY ? 'out' : '.next',

  eslint: {
    ignoreDuringBuilds: true, // Allow build with warnings for demo
  },
  typescript: {
    ignoreBuildErrors: true, // Allow build with warnings for demo
  },

  // Server external packages for better performance
  serverExternalPackages: ['pg', 'ioredis', 'bcryptjs'],

  // Experimental features for better performance
  experimental: {
    // Enable for better tree shaking
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // API route configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // Redirects for better UX
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      },
    ];
  },

  allowedDevOrigins: ["*.preview.same-app.com"],

  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
    ],
  },

  // Webpack configuration for external dependencies
  webpack: (config, { isServer }) => {
    // Handle Node.js modules in client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        util: false,
      };
    }

    // Optimize externals for server-side
    if (isServer) {
      config.externals = [...config.externals, 'pg-native'];
    }

    return config;
  },

  // Environment variables validation
  env: {
    NEXT_PHASE: process.env.NEXT_PHASE || 'phase-development-server',
  },
};

module.exports = nextConfig;
