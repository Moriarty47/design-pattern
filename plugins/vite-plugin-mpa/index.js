import path from 'path';
import { parse } from 'url';
import { getHtmlContent, getPageData, getPages, isMPA, log, resolve } from './utils';

const PLUGIN_NAME = 'vite-plugin-mpa';
let pageName;

/**
 * @name vite-plugin-mpa
 * @param {import('vite').PluginOption & { pagesDir?: string, jumpTarget?: '_self' | '_blank' }} userOptions 
 * @return {import('vite').Plugin}
 */
export default function vitePluginMpa(
  userOptions = {}
) {
  const options = {
    pagesDir: 'src/pages',
    ...userOptions,
    appType: 'mpa',
    jumpTarget: '_self'
  };

  /** @type {import('vite').UserConfig} */
  let config;

  return {
    enforce: 'post',
    name: PLUGIN_NAME,
    configResolved(resolvedConfig) {
      const isBuild = resolvedConfig.mode === 'production';

      if (!options.pages) {
        const { pages, input } = getPages(options);
        options.pages = pages;
        resolvedConfig.build.rollupOptions.input = input;
      }
      config = resolvedConfig;
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const getPage404 = () => {
            res.statusCode = 404;
            res.end('404 not found.');
            return next();
          };

          if (!req.url?.endsWith('.html') && req.url !== '/') {
            return getPage404();
          }


          if (req.originalUrl === '/') {
            return getPage404();
          }

          const url = req.originalUrl.includes(options.pagesDir)
            ? req.originalUrl
            : options.pagesDir + req.originalUrl;

          pageName = (() => {
            if (url === '/') {
              return 'index';
            }
            const parseUrl = parse(url);
            let pathname = parseUrl.pathname;
            if (pathname.endsWith('/')) {
              pathname = pathname.replace(/\/$/, '');
            } else if (pathname.endsWith('.html')) {
              pathname = pathname.replace(/.html$/, '');
            }
            return pathname.match(new RegExp(`${options.pagesDir}/(.*)`))?.[1] || 'index';
          })();

          const page = getPageData(options, `${options.pagesDir}/${pageName}`);
          const templateOption = page.template;
          if (!templateOption) {
            return getPage404();
          }
          const templatePath = templateOption
            ? resolve(templateOption)
            : isMPA(config)
              ? resolve('public/index.html')
              : resolve('index.html');

          const content = await server.transformIndexHtml?.(
            url,
            await getHtmlContent({
              isMPA: isMPA(config),
              entry: options.entry || '/src/main',
              input: config.build.rollupOptions.input,
              pages: options.pages,
              pagesDir: options.pagesDir,
              pageName,
              pageTitle: page.title,
              pageEntry: page.entry || 'main',
              extraData: { url, base: config.base },
              jumpTarget: options.jumpTarget,
              injectOptions: page.inject,
              templatePath,
            }),
            req.originalUrl
          );

          res.end(content);
        });
      };
    },
    resolveId(id) {
      if (id.endsWith('.html')) {
        if (!isMPA(config)) {
          return `src/${path.basename(id)}`;
        } else {
          pageName = last(path.dirname(id).split('/')) || '';
          const _input = config.build.rollupOptions.input;
          for (const key in _input) {
            if (_input[key] === id) {
              return `src/${options.pagesDir.replace('src/', '')}/${pageName}/index.html`;
            }
          }
        }
      }
      return null;
    }
  };
}