import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist/cdn",
    lib: {
      entry: resolve(__dirname, "src/cdn/index.ts"),
      name: "CartaoSimplesWidget",
      fileName: "widget.v1.min",
      formats: ["umd"],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
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
