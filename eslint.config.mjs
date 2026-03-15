import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    ignores: [".next/**", "dist/**", "coverage/**"]
  }
];

export default config;
