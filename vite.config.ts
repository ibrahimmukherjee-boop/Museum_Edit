import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const pagesBase =
  process.env.BASE_PATH ?? (process.env.GITHUB_ACTIONS && repo ? `/${repo}/` : "./");

export default defineConfig({
  plugins: [react()],
  base: pagesBase,
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://127.0.0.1:3001",
    },
  },
});
