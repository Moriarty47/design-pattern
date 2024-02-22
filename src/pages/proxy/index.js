/* 代理模式 */
/* 代理模式的关键是，当客户不方便直接访问一个对象或者不满足需要的时候，提供一个替身
对象来控制对这个对象的访问，客户实际上访问的是替身对象。替身对象对请求做出一些处理之
后，再把请求转交给本体对象 */

/* 虚拟代理实现图片预加载 */

const _preloadImage = (function () {
  const img = document.createElement('img');
  document.body.appendChild(img);
  return {
    setSrc(src) {
      img.src = src;
    }
  };
});

// preloadImage().setSrc('https://volunteer.cdn-go.cn/404/latest/img/dream4school.jpg');

const _proxyImage = (function () {
  const img = new Image();
  img.onload = function () {
    _preloadImage.setSrc(this.src);
  };
  return {
    setSrc(src) {
      _preloadImage.setSrc('../../../images/loading.gif');
      img.src = src;
    }
  };
});

// proxyImage().setSrc('https://volunteer.cdn-go.cn/404/latest/img/dream4school.jpg');

/* 事件代理 */
function clickEvent() {
  const aNodes = document.getElementById('eventProxy').getElementsByTagName('a');
  const aLength = aNodes.length;

  for (let i = 0; i < aLength; i += 1) {
    aNodes[i].addEventListener('click', e => {
      e.preventDefault();
      console.log(`我是${aNodes[i].innerText}`);
    });
  }
}

function clickEventProxy() {
  const divNode = document.getElementById('eventProxy');
  divNode.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      console.log(`我是${e.target.innerText}`);
    }
  });
}

clickEventProxy();

/* 虚拟代理 */
class PreloadImage {
  constructor(img) {
    this.img = img || new Image();
    document.body.appendChild(this.img);
  }

  setSrc(url) {
    this.img.src = url;
  }
}

class ProxyImage {
  static LOADING_URL = '../../../images/loading.gif';

  constructor(targetImg) {
    this.targeImg = targetImg;
  }

  setSrc(url) {
    this.targeImg.setSrc(ProxyImage.LOADING_URL);

    const virtualImg = new Image();

    virtualImg.onload = () => {
      this.targeImg.setSrc(url);
    };

    virtualImg.src = url;
  }
}

// new ProxyImage(new PreloadImage()).setSrc('https://volunteer.cdn-go.cn/404/latest/img/dream4school.jpg');

/* 虚拟代理合并http请求 */

const synchronousFile = function (id) {
  console.log('Start to sync, for id : ', id);
};

const proxySynchronousFile = (function () {
  const cache = [];
  let timer;

  return function (id) {
    cache.push(id);
    if (timer) return;

    timer = setTimeout(() => {
      synchronousFile(cache.join(','));
      clearTimeout(timer);
      timer = null;
      cache.length = 0;
    }, 2000);
  };
})();

const checkBoxes = document.getElementsByTagName('input');
for (let i = 0, cbox; cbox = checkBoxes[i++];) {
  cbox.onclick = function () {
    if (this.checked) {
      // synchronousFile(this.id);
      proxySynchronousFile(this.id);
    }
  };
}

/* 虚拟代理在惰性加载中的应用 */

window.miniConsole = (function () {
  const cache = [];
  const handler = function (e) {
    if (e.keyCode === 113) {
      const script = document.createElement('script');
      script.onload = function () {
        for (let i = 0, fn; fn = cache[i++];) {
          fn();
        }
      };
      script.src = './miniConsole.js';
      document.getElementsByTagName('head')[0].appendChild(script);
      document.body.removeEventListener('keydown', handler);
    }
  };

  document.body.addEventListener('keydown', handler, false);

  return {
    log() {
      const args = arguments;
      cache.push(function () {
        return window.miniConsole.log.apply(window.miniConsole, args);
      });
    }
  };
})();

let i = 1;
document.addEventListener('click', () => {
  window.miniConsole.log(i++);
});

/* 缓存代理 */

/* 高阶函数动态创建缓存代理  */
const addAll = function (...rest) {
  console.log('new calculation.');
  let result = 0;
  const len = rest.length;
  for (let i = 0; i < len; i += 1) {
    result += rest[i];
  }
  return result;
};

const proxyAddAll = (function () {
  const cache = {};
  return (...rest) => {
    const args = Array.prototype.join.call(rest, ',');
    if (args in cache) {
      return cache[args];
    }
    return (cache[args] = addAll(...rest));
  };
})();

// console.log();
// console.log(proxyAddAll(1, 2, 3, 4, 5, 6, 7, 8, 9, 10));
// console.log(proxyAddAll(1, 2, 3, 4, 5, 6, 7, 8, 9, 10));

function mult(...rest) {
  let a = 1;
  for (let i = 0, len = rest.length; i < len; i += 1) {
    a = a * rest[i];
  }
  return a;
}
function plus(...rest) {
  let a = 0;
  for (let i = 0, len = rest.length; i < len; i += 1) {
    a += rest[i];
  }
  return a;
}

function createProxyFactory(fn) {
  if (typeof fn !== 'function') {
    console.error('Required a function param.');
    return;
  }
  const cache = [];
  return function (...rest) {
    const args = Array.prototype.join.call(rest, ',');
    if (args in cache) {
      console.log('Resut already exist, get for you.');
      return cache[args];
    }
    return (cache[args] = fn.apply(this, rest));
  };
}

const proxyMult = createProxyFactory(mult);
const proxyPlus = createProxyFactory(plus);

console.log(proxyMult(1, 2, 3, 4)); // 24
console.log(proxyMult(1, 2, 3, 4)); // 24
console.log(proxyPlus(1, 2, 3, 4)); // 10
console.log(proxyPlus(1, 2, 3, 4)); // 10

/* 防火墙代理 */
// 控制网络资源的访问，保护主题不让“坏人”接近。

/* 远程代理 */
// 为一个对象在不同的地址空间提供局部代表，在 Java 中，远程代理可以是另一个虚拟机中的对象。

/* 保护代理 */
// 用于对象应该有不同访问权限的情况。 
// Proxy 拦截器

/* 智能引用代理 */
// 取代了简单的指针，它在访问对象时执行一些附加操作，比如计算一个对象被引用的次数。

/* 写时复制代理 */
// 通常用于复制一个庞大对象的情况。写时复制代理延迟了复制的过程，当对象被真正修改时，才对它进行复制操作。写时复制代理是虚拟代理的一种变体，DLL（操作系统中的动态链接库）是其典型运用场景。