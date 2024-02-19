/* 单例模式 */
// 保证一个类仅有一个实例，并提供一个访问它的全局访问点。

class SingleDog {
  show() {
    console.log('我是一个单例对象');
  }
  static getInstance() {
    // 判断是否已经new过1个实例
    if (!SingleDog.instance) {
      // 若这个唯一的实例不存在，那么先创建它
      SingleDog.instance = new SingleDog();
    }
    // 如果这个唯一的实例已经存在，则直接返回
    return SingleDog.instance;
  }
}

SingleDog.getInstance2 = (function () {
  let instance = null;
  return function () {
    if (!instance) {
      instance = new SingleDog();
    }
    return instance;
  };
})();

const s1 = SingleDog.getInstance();
const s2 = SingleDog.getInstance();

// true
console.log(s1 === s2);

const localStorage = (function () {
  let store = {};
  return function () {
    return {
      store,
      list() {
        console.log(store);
      },
      getItem(key) {
        return store[key];
      },
      setItem(key, value) {
        return store[key] = value;
      }
    };
  };
})()();
// 实现一个Storage
// 实现Storage，使得该对象为单例，基于 localStorage 进行封装。实现方法 setItem(key,value) 和 getItem(key)。
// 定义Storage
class Storage {
  static getInstance() {
    // 判断是否已经new过1个实例
    if (!Storage.instance) {
      // 若这个唯一的实例不存在，那么先创建它
      Storage.instance = new Storage();
    }
    // 如果这个唯一的实例已经存在，则直接返回
    return Storage.instance;
  }
  getItem(key) {
    return localStorage.getItem(key);
  }
  setItem(key, value) {
    return localStorage.setItem(key, value);
  }
}

const storage1 = Storage.getInstance();
const storage2 = Storage.getInstance();

storage1.setItem('name', '李雷');
// 李雷
storage1.getItem('name');
// 也是李雷
storage2.getItem('name');
localStorage.list();
// 返回true
console.log(storage1 === storage2);

// 先实现一个基础的StorageBase类，把getItem和setItem方法放在它的原型链上
function StorageBase() { }
StorageBase.prototype.getItem = function (key) {
  return localStorage.getItem(key);
};
StorageBase.prototype.setItem = function (key, value) {
  return localStorage.setItem(key, value);
};

// 以闭包的形式创建一个引用自由变量的构造函数
const Storage2 = (function () {
  let instance = null;
  return function () {
    // 判断自由变量是否为null
    if (!instance) {
      // 如果为null则new出唯一实例
      instance = new StorageBase();
    }
    return instance;
  };
})();

// 这里其实不用 new Storage 的形式调用，直接 Storage() 也会有一样的效果 
const storage3 = new Storage2();
const storage4 = new Storage2();

storage3.setItem('name2', '韩梅梅');
// 韩梅梅
storage3.getItem('name2');
// 也是韩梅梅
storage4.getItem('name2');
localStorage.list();
// 返回true
console.log(storage3 === storage4);
