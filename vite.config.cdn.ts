import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist/cdn",
    lib: {
      entry: resolve(__dirname, "src/cdn/index.ts"),
      name: "CartaoSimplesWidget",
      fileName: "widget.v1.min",
      formats: ["umd"],
    },
    rollupOptions: {
      // Remove React das externals para incluí-lo no bundle
      external: [], // Vazio para incluir todas as dependências
      output: {
        inlineDynamicImports: true,
        globals: {}, // Vazio pois não temos externals
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: true,
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
