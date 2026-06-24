import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/po.github.io/",
  plugins: [react()],
});
