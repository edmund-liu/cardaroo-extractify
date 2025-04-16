import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dotenv from 'dotenv';
import { componentTagger } from "lovable-tagger";
import fs from "fs";

dotenv.config();
const HTTPS = false;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: HTTPS ? 443 : 80,
    https: HTTPS
      ? {
        key: fs.readFileSync("private.key", "utf8"),
        cert: fs.readFileSync("certificate.crt", "utf8"),
        }
      : undefined, // Use undefined instead of false when not using HTTPS
      proxy: {
        '/salesforce-token': {
          target: 'https://test.salesforce.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/salesforce-token/, '/services/oauth2/token'),
        },
        '/businesscard': {
          target: 'https://eservices-isca--uat.sandbox.my.site.com',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/businesscard/, '/services/apexrest/mobileAPI/v1/businesscard'),
        },
      },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
