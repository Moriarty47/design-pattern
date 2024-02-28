/* 享元模式 */
/* 享元（flyweight）模式是一种用于性能优化的模式，“fly”在这里是苍蝇的意思，意为蝇量
级。享元模式的核心是运用共享技术来有效支持大量细粒度的对象。 */
/* 如果系统中因为创建了大量类似的对象而导致内存占用过高，享元模式就非常有用了。 */

type Sex = 'male' | 'female';
class Model {
  sex: Sex;
  underwear: string;
  constructor(sex: Sex) {
    this.sex = sex;
  }
  takePhoto() {
    console.log(`sex: ${this.sex}, underwear: ${this.underwear}`);
  }
}

function flyweight1() {
  const maleModel = new Model('male');
  const femaleModel = new Model('female');

  for (let i = 1; i <= 50; i += 1) {
    maleModel.underwear = 'underwear' + i;
    maleModel.takePhoto();
  }
  for (let i = 1; i <= 50; i += 1) {
    femaleModel.underwear = 'underwear' + i;
    femaleModel.takePhoto();
  }
}

// flyweight1();
/* 享元模式要求将对象的属性划分为内部状态与外部
状态（状态在这里通常指属性）。享元模式的目标是尽量减少共享对象的数量。  */

/* 文件上传 */

type UploadFile = {
  filename: string;
  filesize: number;
  dom?: HTMLElement;
};
type UploadType = 'plugin' | 'flash';
function fileUpload() {
  let id = 0;
  function startUpload(uploadType: UploadType, files: UploadFile[]) {
    for (let i = 0, file: UploadFile; file = files[i]; i += 1) {
      // const uploadObj = new Upload(uploadType, file.filename, file.filesize);
      // uploadObj.init(id++);
      uploadManager.add(++id, uploadType, file.filename, file.filesize);
    }
  }

  class Upload {
    uploadType: UploadType;
    filename: string;
    filesize: number;
    dom: HTMLElement;
    id: number;
    constructor(uploadType: UploadType/* , filename: string, filesize: number */) {
      this.uploadType = uploadType;
      // this.filename = filename;
      // this.filesize = filesize;
      // this.dom = null;
    }
    // init(id: number) {
    //   this.id = id;
    //   this.dom = document.createElement('div');
    //   this.dom.innerHTML = `
    //     <div style="margin-bottom: 8px;">
    //       <span>文件名称：${this.filename}, 文件大小：${this.filesize}, 上传类型：${this.uploadType}</span>
    //       <button type="button" class="delFile">删除</button>
    //     </div>
    //   `;
    //   (this.dom.querySelector('.delFile') as HTMLButtonElement).onclick = () => {
    //     this.delFile();
    //   };
    //   document.body.appendChild(this.dom);
    // }
    delFile(id: number) {
      uploadManager.setExternalState(id, this);
      if (this.filesize < 3000) {
        return this.dom.parentNode.removeChild(this.dom);
      }
      if (window.confirm('确定要删除该文件吗？' + this.filename)) {
        return this.dom.parentNode.removeChild(this.dom);
      }
    }
  }

  const UploadFactory = (function () {
    const createdFlyWeightObj: Record<UploadType, Upload> = {} as Record<UploadType, Upload>;
    return {
      create(uploadType: UploadType) {
        if (createdFlyWeightObj[uploadType]) {
          return createdFlyWeightObj[uploadType];
        }
        return createdFlyWeightObj[uploadType] = new Upload(uploadType);
      }
    };
  })();

  const uploadManager = (function () {
    const uploadDatabase: Record<string, UploadFile> = {};
    return {
      add(id: number, uploadType: UploadType, filename: string, filesize: number) {
        const flyWeightObj = UploadFactory.create(uploadType);
        const dom = document.createElement('div');
        dom.innerHTML = `
        <div style="margin-bottom: 8px;">
          <span>文件名称：${filename}, 文件大小：${filesize}, 上传类型：${uploadType}</span>
          <button type="button" class="delFile">删除</button>
        </div>
        `;
        (dom.querySelector('.delFile') as HTMLButtonElement).onclick = () => {
          flyWeightObj.delFile(id);
        };
        document.body.appendChild(dom);
        uploadDatabase[id] = { filename, filesize, dom };
        return flyWeightObj;
      },
      setExternalState(id: number, flyWeightObj: Upload) {
        const uploadData = uploadDatabase[id];
        for (const key in uploadData) {
          if (Object.prototype.hasOwnProperty.call(uploadData, key)) {
            flyWeightObj[key] = uploadData[key];
          }
        }
      }
    };
  })();

  startUpload('plugin', [
    {
      filename: '1.txt',
      filesize: 1000
    },
    {
      filename: '2.html',
      filesize: 3000
    },
    {
      filename: '3.txt',
      filesize: 5000
    }
  ]);
  startUpload('flash', [
    {
      filename: '4.txt',
      filesize: 1000
    },
    {
      filename: '5.html',
      filesize: 3000
    },
    {
      filename: '6.txt',
      filesize: 5000
    }
  ]);
}

// fileUpload();

/* 对象池 */
/* 对象池维护一个装载空闲对象的池子，如果需要对象的时候，不是直接 new，而是转从对象池里获取。如
果对象池里没有空闲对象，则创建一个新的对象，当获取出的对象完成它的职责之后， 再进入
池子等待被下次获取 */
/* 对象池技术的应用非常广泛，HTTP 连接池和数据库连接池都是其代表应用。在 Web 前端开
发中，对象池使用最多的场景大概就是跟 DOM 有关的操作。很多空间和时间都消耗在了 DOM
节点上，如何避免频繁地创建和删除 DOM 节点就成了一个有意义的话题 */

function useObjectPool() {
  const append = document.body.append;
  Object.defineProperty(document.body, 'append', {
    value(...nodes: (string | Node)[]) {
      console.log('append nodes.');
      return append.call(document.body, ...nodes);
    }
  });

  class TooltipFactory {
    tooltipPool: HTMLElement[] = [];

    create() {
      if (this.tooltipPool.length === 0) {
        const div = document.createElement('div');
        // document.body.append(div); // simulate1
        return div;
      }
      return this.tooltipPool.shift();
    }
    recover(tooltipDom: HTMLElement) {
      return this.tooltipPool.push(tooltipDom);
    }
  }
  const tooltipFactory = new TooltipFactory();
  const tooltipCache: HTMLElement[] = [];

  function recoverDom() {
    for (let i = 0, tooltip: HTMLElement; tooltip = tooltipCache[i]; i += 1) {
      tooltipFactory.recover(tooltip);
    }
  }

  function simulate1() {
    for (let i = 0, str: string; str = ['A', 'B'][i]; i += 1) {
      const tooltip = tooltipFactory.create();
      tooltip.innerHTML = str;
      tooltipCache.push(tooltip);
    }

    recoverDom();

    for (let i = 0, str: string; str = ['A', 'B', 'C', 'D', 'E', 'F'][i]; i += 1) {
      const tooltip = tooltipFactory.create();
      tooltip.innerHTML = str;
      tooltipCache.push(tooltip);
    }
  }
  // simulate1();
  function domCreate<T>(info: T[]) {
    const infoIterator = info[Symbol.iterator]();
    let res: IteratorResult<T> = { done: false, value: undefined };
    while (!res.done) {
      res = infoIterator.next();
      if (res.done) {
        document.body.append(...tooltipCache);
      } else {
        const tooltip = tooltipFactory.create();
        tooltip.innerHTML = res.value;
        tooltipCache.push(tooltip);
      }
    }
  }
  function simulate2() {
    domCreate(['A', 'B']);
    recoverDom();
    domCreate(['A', 'B', 'C', 'D', 'E', 'F']);
  }
  // simulate2();

  type ObjectPoolFactoryFn<T> = (...rest: any[]) => T;
  class ObjectPoolFactory<T> {
    objectPool: T[] = [];
    createFn: ObjectPoolFactoryFn<T>;
    constructor(createFn: ObjectPoolFactoryFn<T>) {
      this.createFn = createFn;
    }
    create(...rest: any[]) {
      const obj = this.objectPool.length === 0
        ? this.createFn(...rest)
        : this.objectPool.shift();
      return obj;
    }
    recover(obj: T) {
      this.objectPool.push(obj);
    }
  }
  function simulate3() {
    const iframeFactory = new ObjectPoolFactory(function () {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.onload = null; // 防止ifram重复加载的bug
        iframeFactory.recover(iframe); // iframe加载完成之后回收节点
      };
      return iframe;
    });
    const iframe1 = iframeFactory.create();
    iframe1.src = 'http://baidu.com';
    const iframe2 = iframeFactory.create();
    iframe2.src = 'http://google.com';
    setTimeout(() => {
      const iframe3 = iframeFactory.create();
      iframe3.src = 'http://163.com';
    }, 3000);
  }
  // simulate3();
}

useObjectPool();
