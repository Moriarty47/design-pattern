/* 适配器模式 */
/* 适配器模式主要用来解决两个已有接口之间不匹配的问题，它不考虑这些接口是怎样实
现的，也不考虑它们将来可能会如何演化。适配器模式不需要改变已有的接口，就能够
使它们协同作用 */

class HttpUtils {
  static get(url) {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  static post(url, data) {
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoeded'
        },
        body: HttpUtils.changeData(data)
      })
        .then(res => res.json())
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  static changeData(obj) {
    let str = '', i = 0;
    for (const prop in obj) {
      if (!prop) return;
      if (i === 0) {
        str += prop + '=' + obj[prop];
      } else {
        str += '&' + prop + '=' + obj[prop];
      }
      i++;
    }
    return str;
  }
}

const URL = 'http://127.0.0.1';
const params = {
  id: 1
};

// const postRes = await HttpUtils.post(URL, params) || {};
// console.log(postRes);
// const getRes = await HttpUtils.get(URL) || {};
// console.log(getRes);

/**
 * @param {RequestMethod} type 
 * @param {string} url 
 * @param {any} data 
 * @param {(res) => void} onSuccess 
 * @param {(err) => void} onFailed 
 */
function Ajax(type, url, data, onSuccess, onFailed) {
  /** @type {XMLHttpRequest | ActiveXObject} */
  let xhr = null;
  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else {
    xhr = new ActiveXObject('Microsoft.XMLHTTP');
  }

  type = type.toUpperCase();

  if (type === 'GET') {
    if (data) {
      xhr.open(type, url + '?' + data, true);
    }
    xhr.send();
  } else if (type === 'POST') {
    xhr.open(type, url, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoeded');
    xhr.send(data);
  }

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        onSuccess && onSuccess({
          statusCode: xhr.status,
          data: xhr.responseText
        });
      } else {
        onFailed && onFailed({
          statusCode: xhr.status,
          error: xhr.statusText
        });
      }
    }
  };
}

// Ajax('GET', 'http://127.0.0.1', 'id=1', res => {
//   console.log(res);
// }, err => {
//   console.error(err);
// });

/**
 * @param {RequestMethod} type 
 * @param {string} url 
 * @param {any} data 
 * @param {(res) => void} onSuccess 
 * @param {(err) => void} onFailed 
 */
async function AjaxAdpator(type, url, data, onSuccess, onFailed) {
  type = type.toUpperCase();
  let res;
  try {
    if (type === 'GET') {
      res = await HttpUtils.get(url) || {};
    } else if (type === 'POST') {
      res = await HttpUtils.post(url, data) || {};
    }
    res.statusCode === 1 && onSuccess ? onSuccess(res) : (onFailed && onFailed(res.statusCode));
  } catch (error) {
    onFailed && onFailed(error.statusCode);
  }
}

/**
 * @param {RequestMethod} type 
 * @param {string} url 
 * @param {any} data 
 * @param {(res) => void} onSuccess 
 * @param {(err) => void} onFailed 
 */
async function Ajax2(type, url, data, onSuccess, onFailed) {
  await AjaxAdpator(type, url, data, onSuccess, onFailed);
}


Ajax2('GET', 'http://127.0.0.1', 'id=1', res => {
  console.log(res);
}, err => {
  console.error(err);
});


/**
 * @typedef {'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH' | 'TRACE' | 'CONNECT' | 'COPY' | 'LINK' | 'UNLINK' | 'PURGE' | 'LOCK' | 'UNLOCK' | 'MKCOL' | 'MOVE' | 'PROPFIND' | 'REPORT' | 'VIEW'} RequestMethod 
 */