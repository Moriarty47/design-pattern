import path from 'path';
import { parse } from 'url';
import micromatch from 'micromatch';
import { getHtmlContent, getPageData, getPages, getTitle, isMPA, matchJsCreateRule, posixPath, resolve } from './utils';
import getFirstLineSync from '../../helpers/getFirstLineSync';

const PLUGIN_NAME = 'vite-plugin-mpa';

let pageName;

let i = 0;

/** @typedef {import('vite').PluginOption & { pagesDir: string, jumpTarget: '_self' | '_blank', delay: number, root: string }} MpaOption */
/**
 * @name vite-plugin-mpa
 * @param {Partial<MpaOption>} userOptions 
 * @return {import('vite').Plugin}
 */
export default function vitePluginMpa(
  userOptions = {}
) {
  /** @type {MpaOption} */
  const options = {
    ...userOptions,
    pagesDir: userOptions.pagesDir || 'src/pages',
    jumpTarget: '_self',
    appType: 'mpa',
    delay: 500,
  };

  let root = process.cwd();
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;
  /** @type {import('vite').UserConfig} */
  let config;
  let jsGlobs;
  let htmlGlobs;

  const fileFirstLineCache = {};

  function clear() {
    clearTimeout(timer);
  }

  /** @param {() => void} fn */
  function schedule(fn) {
    clear();
    timer = setTimeout(fn, options.delay);
  }

  return {
    enforce: 'post',
    name: `${PLUGIN_NAME}:${i++}`,
    config(c) {
      if (!c.server) {
        c.server = {};
      }
      if (!c.server.watch) {
        c.server.watch = {};
      }
      c.server.watch.disableGlobbing = false;
    },
    configResolved(resolvedConfig) {
      const isBuild = resolvedConfig.mode === 'production';

      const dir = options.pagesDir;

      /* famous last words, but this *appears* to always be an absolute path
      with all slashes normalized to forward slashes `/`. this is compatible
      with path.posix.join, so we can use it to make an absolute path glob */
      root = resolvedConfig.root;
      options.root = root;

      jsGlobs = posixPath([
        `${dir}/*.js`,
        `${dir}/*/*.js`,
      ], root);
      htmlGlobs = posixPath([
        `${dir}/index.html`,
        `${dir}/*/*.html`,
      ], root);

      options.fileFirstLineCache = fileFirstLineCache;
      if (!options.pages) {
        const { pages, input } = getPages(options);
        options.pages = pages;
        resolvedConfig.build.rollupOptions.input = input;
      }
      config = resolvedConfig;
    },
    configureServer(server) {
      const allGlobs = [...jsGlobs, ...htmlGlobs];
      server.watcher.add(allGlobs);
      server.watcher.on('add', handleFileAdd);
      server.watcher.on('change', handleFileChange);
      server.watcher.on('unlink', handleFileUnlink);

      function handleFileAdd(file) {
        isMatchGlobs('add', file, () => {
          fileFirstLineCache[file] = null;
        });
      }

      function handleFileChange(file) {
        const firstLine = getFirstLineSync(file);
        if (micromatch.isMatch(file, jsGlobs)) {
          const title = getTitle(firstLine);
          const oldTitle = fileFirstLineCache[file];
          if (oldTitle !== title) {
            fileFirstLineCache[file] = title;
            console.log('entry js title changed :>>', file);
            server.restart();
          }
        } else if (micromatch.isMatch(file, htmlGlobs) && !matchJsCreateRule(firstLine)) {
          console.log('html changed :>>', file);
          server.restart();
        }
      }

      function handleFileUnlink(file) {
        isMatchGlobs('unlink', file, () => {
          fileFirstLineCache[file] = null;
        });
      }

      function isMatchGlobs(type, file, fn) {
        if (micromatch.isMatch(file, allGlobs)) {
          fn?.();
          console.log(type, file);
          return true;
        }
        return false;
      }


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
              entry: options.entry || '',
              input: config.build.rollupOptions.input,
              pages: options.pages,
              pagesDir: options.pagesDir,
              pageName,
              pageTitle: page.title,
              pageEntry: page.entry || '',
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
    },
  };
}