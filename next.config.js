/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // 環境変数の設定
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // 画像最適化の設定
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zwlzgizouoltibrzmpxg.supabase.co",
      },
      {
        protocol: "https",
        hostname: "rowbfdvlksrlszkxkzzd.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // ヘッダー設定
  async headers() {
    return [
      {
        source: '/api/survey/check-review-limit',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },

  // リダイレクト設定
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/login',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;