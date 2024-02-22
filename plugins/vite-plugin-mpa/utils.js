import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import { globSync } from 'glob';
import { fileURLToPath } from 'url';
import getFirstLineSync from '../../helpers/getFirstLineSync';

export const resolve = p => path.resolve(process.cwd(), p);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const templateHTML = fs.readFileSync(path.resolve(__dirname, './template.tpl'), 'utf-8');

/**
 * @param {import('vite').ResolvedConfig} viteConfig 
 */
export function isMPA(viteConfig) {
  const input = viteConfig?.build?.rollupOptions?.input ?? undefined;
  return typeof input !== 'string' && Object.keys(input || {}).length >= 1;
};

export function isPlainObject(val) {
  if (Object.prototype.toString.call(val) !== '[object Object]') return false;

  const prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

export function isEmptyObject(val) {
  return isPlainObject(val) && Object.getOwnPropertyNames(val).length === 0;
};

export function pick(obj, keys) {
  return keys.reduce((res, key) => {
    if (obj.hasOwnProperty(key)) {
      res[key] = obj[key];
    }
    return res;
  }, {});
}

export function last(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return undefined;
  return arr[arr.length - 1];
}

export function toArray(arr) {
  if (!arr) return [];
  if (Array.isArray(arr)) return arr;
  return [arr];
}

export function getTitle(title) {
  return title.match(/\/\* (.*) \*\//)?.[1] || 'Default';
}

export function getPages(options) {
  const dir = options.pagesDir;
  const filesUrl = globSync([`${dir}/**/index.js`, `${dir}/**/*.html`]).map(url => url.replace(/\\/g, '/'));
  const files = filesUrl.map(url => [url, path.dirname(url), path.basename(url), path.extname(url)]);
  const input = {};
  const pages = files.reduce((page, file) => {
    if (!file) return page;
    const [fileUrl, filePath, fileName, ext] = file || [];
    const htmlName = fileUrl.replace(/.js$/, '.html');
    const htmlUrl = resolve(htmlName);
    let title;
    if (ext === '.js') {
      title = getTitle(getFirstLineSync(fileUrl) || title);
      if (!globSync(htmlName)[0]) {
        // 不存在html，则生成新的html
        fs.writeFileSync(htmlUrl, ejs.render(templateHTML, {
          content: { title }
        }), { encoding: 'utf-8' });
      }
    }
    // 获取title
    let content = fs.readFileSync(htmlUrl, { encoding: 'utf-8' });
    if (title) {
      content = content.replace(/<title>(.*?)>/, `<title>${title}</title>`);
      fs.writeFileSync(htmlUrl, ejs.render(content, {
        content: { title }
      }), { encoding: 'utf-8' });
    } else {
      title = content.match(/<title>(.*)<\/title>/)[1] || 'Default';
    }

    const url = htmlName.replace('.html', '');
    if (!page[url]) {
      page[url] = {
        title,
        entry: fileName.replace(/.html$/, '.js'),
        filename: fileName,
        template: resolve(htmlUrl),
      };
      input[url] = page[url].template;
    }
    return page;
  }, {});
  return { pages, input };
}

export function getPageData(options, pageName) {
  let page = {};

  const isSpa = isEmptyObject(options.pages);

  if (isSpa) {
    page = pick(options, [
      'entry',
      'title',
      'inject',
      'filename',
      'template',
      'urlParams',
    ]);
  } else if (options.pages[pageName]) {
    page = options.pages[pageName];
  } else if (options.pages[`${pageName}/index`]) {
    page = options.pages[`${pageName}/index`];
  }
  return page;
}

async function readHtmlTemplate(templatePath) {
  return fs.promises.readFile(templatePath, { encoding: 'utf-8' });
}

/**
 * @param {ContentOptions} options 
 */
export async function getHtmlContent(options) {
  const {
    isMPA,
    entry,
    input,
    pages,
    pagesDir,
    pageName,
    pageTitle,
    pageEntry,
    extraData,
    jumpTarget,
    injectOptions,
    templatePath,
  } = options || {};

  let content = '';
  let pageDirName;

  const entryJsPath = (() => {
    if (isMPA) {
      if (pageEntry.includes('src')) {
        return `${pageEntry.replace('/./', '/').replace('//', '/')}`;
      }
      pageDirName = pageName.split('/')[0];
      if (pageEntry.includes(pageDirName)) {
        pageDirName = '';
      } else {
        pageDirName += '/';
      }
      return ['', 'index.html', pagesDir, `${pagesDir}/`].includes(extraData.url)
        ? `/${pagesDir}/${pageEntry}`
        : `/${pagesDir}/${pageDirName}${pageEntry}`;
    }
    return entry;
  })();

  try {
    content = await readHtmlTemplate(templatePath);
  } catch (error) {
    console.error(error);
  }

  const inputKeys = Object.keys(input || {});
  const pagesKeys = Object.keys(pages);

  function getHref(item, params) {
    const _params = params ? '?' + params : '';
    return isMPA
      ? `/${item}.html${_params}`
      : `/${pagesDir}/index.html${_params}`;
  }

  const links = inputKeys.map(item => {
    if (pagesKeys.includes(item)) {
      const href = getHref(item, pages[item].urlParams);
      return `<li><a target="${jumpTarget}" href="${href}">${pages[item].title || ''}</a></li>`;
    }
    return `<li><a target="${jumpTarget}" href="${getHref(item)}">${item}</a></li>`;
  });

  if (links?.length) {
    content = content.replace(/\n|\r/g, '').replace(/<body(.*?)>(.*)<\/body>/, (_, $1, $2) => `<body${$1}><ul>${links.join('').replace(/,/g, ' ')}</ul>\n${$2}</body>`);
  }
  if (isMPA) {
    content = content.replace('</body>', `<script type="module" src="${entryJsPath}"></script></body>`);
  }

  const { data, ejsOptions } = injectOptions || {
    data: {}, ejsOptions: {}
  };

  return ejs.render(
    content,
    {
      title: pageTitle || 'Default',
      ...data,
    },
    ejsOptions
  );
};

/**
 * @typedef ContentOptions
 * @property {boolean} isMPA
 * @property {string} entry
 * @property {any} input
 * @property {any} pages
 * @property {string} pagesDir
 * @property {string} pageName
 * @property {string} pageTitle
 * @property {string} pageEntry
 * @property {{ base: string, url: string }} extraData
 * @property {'_self' | '_blank'} jumpTarget
 * @property {{ data: object, ejsOptions: object }} injectOptions
 * @property {string} templatePath
 */;

export function log(obj, label = 'default') {
  console.log(`\n${label} >>>>>> \n`, obj);
}
