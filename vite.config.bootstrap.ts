import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/bootstrap",
    lib: {
      entry: resolve(__dirname, "src/bootstrap/index.ts"),
      name: "PaymentWidgetBootstrap",
      fileName: "widget-bootstrap.v1.min",
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
