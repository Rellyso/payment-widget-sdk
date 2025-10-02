import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist/bootstrap",
    lib: {
      entry: resolve(__dirname, "src/bootstrap/index.ts"),
      name: "PaymentWidgetBootstrap",
      fileName: (format) =>
        `widget-bootstrap.v1.min.${format === "umd" ? "js" : format}`,
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
