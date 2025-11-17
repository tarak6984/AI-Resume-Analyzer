import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig({
  plugins: [
    tailwindcss(), 
    reactRouter(), 
    tsconfigPaths(),
    ...(process.env.ANALYZE ? [analyzer()] : [])
  ],
  optimizeDeps: {
    include: ['zustand', 'clsx', 'tailwind-merge', 'react', 'react-dom', 'react-router'],
    exclude: ['pdfjs-dist']
  },
  build: {
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './app/test/setup.ts',
  },
});
