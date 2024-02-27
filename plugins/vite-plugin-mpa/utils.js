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

export function posixPath(p, root = process.cwd()) {
  const paths = toArray(p);
  return paths.map(i => {
    if (i.startsWith('!')) {
      return `!${path.posix.join(root, i.slice(1))}`;
    }
    return path.posix.join(root, i);
  });
};

export function matchHtmlCreateRule(content) {
  return content.match(/\/\* (.*) \*\//)?.[1];
}

export function matchJsCreateRule(content) {
  return content.match(/<!-- (.*) -->/)?.[1] !== 'js-in-html';
}

export function getTitle(content) {
  const title = matchHtmlCreateRule(content);
  if (title !== null && title !== undefined) {
    return title || 'New Page';
  }
  return null;
}

/**
 * @param {string} htmlUrl 
 * @param {boolean} isTs 
 * @returns {string}
 */
function getJsUrl(htmlUrl, isTs = false) {
  return htmlUrl.replace(/\.html$/, isTs ? '.ts' : '.js');
}

/**
 * @param {string} jsUrl 
 * @returns {string}
 */
function getHtmlUrl(jsUrl) {
  return jsUrl.replace(/\.(j|t)s$/, '.html');
}

/**
 * @typedef FileInfo
 * @property {string} fileUrl
 * @property {'js' | 'ts' | 'html'} fileExt
 * @property {string} filename
 * @property {string} fileFullname
 * @property {string} fileAbsUrl
 * @property {string} fileDirPath
 */

/**
 * 获取目标目录下的所有js与html文件
 * @param {string} dir 
 * @returns {FileInfo[]}
 */
function getFilesOfTargetDir(dir) {
  return globSync([
    `${dir}/index.{j,t}s`,
    `${dir}/index.html`,
    `${dir}/*/*.{j,t}s`,
    `${dir}/*/*.html`,
    `!${dir}/index/*.{j,t}s`,
    `!${dir}/index/*.html`,
  ])
    .map(url => {
      const fileUrl = url.replace(/\\/g, '/');
      const fileExt = path.extname(fileUrl).slice(1);
      const fileFullname = path.basename(fileUrl);
      return {
        fileUrl,
        fileExt,
        filename: fileFullname.replace('.' + fileExt, ''),
        fileFullname,
        fileAbsUrl: resolve(fileUrl),
        fileDirPath: path.dirname(fileUrl),
      };
    });
}

/** 
 * @typedef MpaInputItem
 * @property {string} title
 * @property {string} filename
 * @property {string} tempalte
 * @property {string} entry
 */
/** @typedef {Record<string, MpaInputItem>} MpaPages */
/** @typedef {Record<string, string>} MpaInput */
/**
 * 
 * @param {string} templateUrl 
 * @param {FileInfo} file 
 * @param {{{ pages: MpaPages, input: MpaInput }}} cache 
 * @param {import('./index').MpaOption} options  
 * @param {string} [title='New Page'] 
 */
function saveInfo(templateUrl, file, cache, options, title = 'New Page') {
  const pageUrl = `${file.fileDirPath}/${file.filename}`;
  if (!cache.pages[pageUrl]) {
    options.fileFirstLineCache[file.fileAbsUrl] = title;
    cache.pages[pageUrl] = {
      title,
      filename: file.filename,
      template: templateUrl,
      entry: file.fileFullname.match(/.html$/) ? undefined : file.fileFullname,
    };
    cache.input[pageUrl] = templateUrl;
  }
}

/**
 * 处理JS文件
 * @param {FileInfo} file
 * @param {{{ pages: MpaPages, input: MpaInput }}} cache 
 * @param {import('./index').MpaOption} options  
 */
function processJsFile(file, cache, options) {
  const { fileAbsUrl, filename } = file;
  const title = getTitle(getFirstLineSync(fileAbsUrl));
  // 不是一个入口文件
  if (title === null) {
    log('不是入口文件', filename);
    return;
  }
  // 是一个入口文件
  const htmlAbsUrl = getHtmlUrl(fileAbsUrl);
  if (!fs.existsSync(htmlAbsUrl)) {
    // 不存在对应的HTML文件，则创建HTML文件
    fs.writeFileSync(htmlAbsUrl, ejs.render(templateHTML, {
      content: { title }
    }), { encoding: 'utf-8' });
    log('创建HTML文件', htmlAbsUrl);
  }

  saveInfo(htmlAbsUrl, file, cache, options, title);
}

function getHtmlTitle(content) {
  return content.match(/<title>(.*)<\/title>/)?.[1] || undefined;
}

/**
 * 处理HTML文件
 * @param {FileInfo} file
 * @param {{{ pages: MpaPages, input: MpaInput }}} cache 
 * @param {import('./index').MpaOption} options  
 */
function processHtmlFile(file, cache, options) {
  const { fileAbsUrl, filename } = file;
  const matched = matchJsCreateRule(getFirstLineSync(fileAbsUrl));
  if (matched) {
    const jsAbsUrl = getJsUrl(fileAbsUrl);
    const tsAbsUrl = getJsUrl(fileAbsUrl, true);
    if (!fs.existsSync(jsAbsUrl)) {
      if (!fs.existsSync(tsAbsUrl)) {
        // 该HTML文件不存在对应的JS\TS文件，则创建JS文件
        log('创建JS文件', jsAbsUrl);
        fs.writeFileSync(jsAbsUrl, `/* ${filename} */`, { encoding: 'utf-8' });
      }
    }
    saveInfo(fileAbsUrl, file, cache, options);
  } else {
    log('不需要JS文件', filename);
    const title = getHtmlTitle(fs.readFileSync(fileAbsUrl, 'utf-8'));
    saveInfo(fileAbsUrl, file, cache, options, title);
  }

}

/**
 * 处理文件
 * @param {FileInfo[]} files 
 * @param {import('./index').MpaOption} options 
 * @returns {{ pages: MpaPages, input: MpaInput }}
 */
function processFiles(files, options) {
  const cache = { pages: {}, input: {} };
  for (let i = 0, len = files.length; i < len; i += 1) {
    const file = files[i];
    if (file.fileExt === 'js' || file.fileExt === 'ts') {
      processJsFile(file, cache, options);
    } else if (file.fileExt === 'html') {
      processHtmlFile(file, cache, options);
    }
  }
  // log('files', files);
  // log('pages', cache.pages);
  // log('input', cache.input);
  return cache;
}

/**
 * 获取页面配置
 * @param {import('./index').MpaOption} options 
 * @returns {{ pages: MpaPages, input: MpaInput }}
 */
export function getPages(options) {
  return processFiles(
    getFilesOfTargetDir(options.pagesDir, options.root),
    options
  );
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
      if (pageEntry === '') return null;
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
      const className = extraData.url === href ? 'class="active"' : '';
      return `<li><a target="${jumpTarget}" href="${href}" ${className}>${pages[item].title || ''}</a></li>`;
    }
    return `<li><a target="${jumpTarget}" href="${getHref(item)}">${item}</a></li>`;
  });

  if (links?.length) {
    content = content.replace(/\n|\r/g, '').replace(/<body(.*?)>(.*)<\/body>/, (_, $1, $2) => `<body${$1}><ul><style>.active{color: red;}</style>${links.join('').replace(/,/g, ' ')}</ul>\n${$2}</body>`);
  }
  if (isMPA) {
    if (entryJsPath) {
      content = content.replace('</body>', `<script type="module" src="${entryJsPath}"></script></body>`);
    }
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

export function log(label = 'Output', ...obj) {
  console.log(`\n${label} >>>>>> \n`, ...obj);
}
