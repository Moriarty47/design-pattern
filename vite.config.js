import { defineConfig } from 'vite';
import vitePluginMpa from './plugins/vite-plugin-mpa';
import vitePluginBabel from 'vite-plugin-babel';
// import vitePluginInspect from 'vite-plugin-inspect';

export default defineConfig({
  plugins: [
    vitePluginMpa({
      pagesDir: 'src/pages'
    }),
    vitePluginBabel(),
    // vitePluginInspect(),
  ],
});
