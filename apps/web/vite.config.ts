import { defineConfig, PluginOption } from "vite";
import { enterDevPlugin, enterProdPlugin } from 'vite-plugin-enter-dev';
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sharedAliases = {
  "@housemates/shared-types": path.resolve(__dirname, "../../libs/shared/types/src"),
  "@housemates/shared-utils": path.resolve(__dirname, "../../libs/shared/utils/src"),
  "@housemates/shared-data": path.resolve(__dirname, "../../libs/shared/data/src"),
  "@housemates/shared-supabase": path.resolve(__dirname, "../../libs/shared/supabase/src"),
  "@housemates/shared-ui": path.resolve(__dirname, "../../libs/shared/ui/src"),
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [
    ...enterProdPlugin(),
  ];
  if (mode === 'development') {
    plugins.push(...enterDevPlugin());
  }
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: plugins.filter(Boolean) as PluginOption[],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        ...sharedAliases,
      },
    },
    base: '/',
    build: {
      outDir: 'dist',
    }
  };
});
