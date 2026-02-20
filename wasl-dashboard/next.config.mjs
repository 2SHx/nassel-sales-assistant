/** @type {import('next').NextConfig} */
const nextConfig = {
    // Simplified config to isolate build issues
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
