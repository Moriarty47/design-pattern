import { defineConfig } from 'vite';
import vitePluginMpa from './plugins/vite-plugin-mpa';
import vitePluginBabel from 'vite-plugin-babel';

export default defineConfig({
  plugins: [
    vitePluginMpa({
      pagesDir: 'src/pages'
    }),
    vitePluginBabel(),
  ],
});
