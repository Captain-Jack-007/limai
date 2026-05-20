/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth', 'pptxgenjs', 'docx'],
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
