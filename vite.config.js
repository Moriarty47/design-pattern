import { defineConfig } from 'vite';
import vitePluginMpa from './plugins/vite-plugin-mpa';

export default defineConfig({
  plugins: [
    vitePluginMpa({
      pagesDir: 'src/pages'
    }),
  ],
});
