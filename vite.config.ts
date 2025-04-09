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
