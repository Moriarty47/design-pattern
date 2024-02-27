/* 发布-订阅模式 */
/* 观察者模式 */

/* 它定义对象间的一种一对多的依赖关系，当一个对象的状
态发生改变时，所有依赖于它的对象都将得到通知。在 JavaScript 开发中，我们一般用事件模型
来替代传统的发布—订阅模式。 */

class Publisher {
  name: string;
  observers: Observer[];
  constructor(name: string) {
    this.name = name;
    this.observers = [];
  }

  add(...observers: Observer[]) {
    console.log('add observers: ', observers.map(ob => ob.name).join(','));
    this.observers.push(...observers);
  }

  remove(...observers: Observer[]) {
    for (let i = 0; i < this.observers.length; i += 1) {
      if (observers.includes(this.observers[i])) {
        console.log('remove observer: ', this.observers[i].name);
        this.observers.splice(i, 1);
        i--;
      }
    }
  }

  notify(payload?: any) {
    console.log('notify observers');
    this.observers.forEach(observer => {
      observer.update(this, payload);
    });
  }
}

class Observer {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  update(publisher: Publisher, payload?: any) {
    console.log(this.name, 'Has been notified.');
  }
}

class PrdPublisher extends Publisher {
  prdState: any;
  constructor(name: string) {
    super(name);
    this.prdState = null;
  }

  getState() {
    return this.prdState;
  }

  setState(state: any) {
    this.prdState = state;
    this.notify();
  }
}

class DevObserver extends Observer {
  prdState: any;
  constructor(name: string) {
    super(name);
    this.prdState = {};
  }

  update(publisher: PrdPublisher, payload?: any): void {
    this.prdState = publisher.getState();
    this.work();
  }

  work() {
    const prd = this.prdState;
    console.log(prd);
  }
}

const A = new DevObserver('A');
const B = new DevObserver('B');
const C = new DevObserver('C');
const PM = new PrdPublisher('PM');

const prd = {
  first: 'A',
  second: 'B',
  third: 'C'
};

// 每次调用太麻烦
// PM.add(A);
// PM.add(B);
// PM.add(C);

PM.add(A, B, C);

// setTimeout(() => {
//   PM.setState(prd);
// }, 2000);

// setTimeout(() => {
//   PM.remove(B, C);
// }, 4000);


// Vue 响应式系统

function observe(target: object) {
  if (target && typeof target === 'object') {
    Object.keys(target).forEach(key => {
      defineReactive(target, key, target[key]);
    });
  }
}

function defineReactive(target: object, key: string, value: any) {
  const dep = new Dep();

  observe(value);

  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: false,
    get() {
      return value;
    },
    set(val) {
      console.log(`${target}属性${key} 从 ${value} 值变成了 ${val}`);
      value = val;
      dep.notify();
    }
  });
}

type Sub = {
  update(): void;
};

class Dep {
  subs: Sub[];
  constructor() {
    this.subs = [];
  }

  addSub(sub: Sub) {
    this.subs.push(sub);
  }

  notify() {
    this.subs.forEach(sub => {
      sub.update();
    });
  }
}

const obj = {
  a: 1,
  b: '2'
};
observe(obj);
obj.a = 2;
obj.b = '111';
console.log('obj :>>', obj);

type EventName = string;
type EventNamespace = string;
type EventCallback = (...args: any[]) => void;

type EventHandler = Record<EventName, EventCallback[]>;
type EventNamespaceCache = Record<EventNamespace, EventEmitter>;

class EventEmitter {
  handlers: EventHandler;
  offlineHandlers: EventHandler;
  namespaceCache: EventNamespaceCache;

  constructor() {
    this.handlers = {};
    this.offlineHandlers = {};
    this.namespaceCache = {};
  }

  use(namespace: EventNamespace) {
    if (!this.namespaceCache[namespace]) {
      this.namespaceCache[namespace] = new EventEmitter();
    }
    return this.namespaceCache[namespace];
  }

  on(eventName: EventName, cb: EventCallback) {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    this.handlers[eventName].push(cb);
    if (this.offlineHandlers[eventName]) {
      this.offlineHandlers[eventName].forEach(handler => {
        cb(...handler() as any);
      });
      Reflect.deleteProperty(this.offlineHandlers, eventName);
    }
  }

  emit(eventName: EventName, ...args: any[]) {
    if (this.handlers[eventName]) {
      const handlers = this.handlers[eventName].slice();
      handlers.forEach(cb => {
        cb(...args);
      });
    } else {
      const wrapper = () => args;
      if (!this.offlineHandlers[eventName]) {
        this.offlineHandlers[eventName] = [];
      }
      this.offlineHandlers[eventName].push(wrapper);
    }
  }

  off(eventName: EventName, cb: EventCallback) {
    const callbacks = this.handlers[eventName];
    const pos = callbacks.indexOf(cb);
    if (pos !== -1) {
      callbacks.splice(pos, 1);
    }
  }

  once(eventName: EventName, cb: EventCallback) {
    const wrapper = (...args: any[]) => {
      cb(...args);
      this.off(eventName, wrapper);
    };
    this.on(eventName, wrapper);
  }
}

// DOM 事件

const btn = document.getElementById('btn');
const div = document.getElementById('show');

// btn.addEventListener('click', () => {
//   console.log('Clicked !');
// });
// setTimeout(() => {
//   btn.dispatchEvent(new Event('click'));
// }, 2000);

// 自定义事件

let count = 0;
div.innerHTML = `${count}`;
const bus = new EventEmitter();
bus.on('add', param => {
  div.innerHTML = param;
});
btn.onclick = () => {
  bus.emit('add', ++count);
};

const aClick = e => console.log(e);
bus.use('name1').on('click', aClick);
bus.use('name1').emit('click', 'name1 clicked!');
bus.use('name1').off('click', aClick);
bus.use('name1').emit('click', 'name1 clicked!');
bus.use('name1').emit('click', 'name1 clicked!');

bus.use('name2').emit('click', 'name2 offline message 1 clicked!');
bus.use('name2').emit('click', 'name2 offline message 2 clicked!');
bus.use('name2').emit('click', 'name2 offline message 3 clicked!');
bus.use('name2').on('click', e => {
  console.log(e);
});
bus.use('name2').emit('click', 'name2 clicked!');

// 必须先订阅再发布吗？
// 在某些情况下，我们需要先将这条消息保存下来，等到有对象来订阅它的时候，再重新把消息发布给订阅者。就如同 QQ 中的离线消息一样，离线消息被保存在服务器中，接收人下次登录上线之后，可以重新收到这条消息。


// 优点：一为时间上的解耦，二为对象之间的解耦。它的应用非常广泛，既可以用在异步编程中，也可以帮助我们完成更松耦合的代码编写。发布—订阅模式还可以用来帮助实现一些别的设计模式，比如中介者模式。从架构上来看，无论是 MVC 还是 MVVM，都少不了发布—订阅模式的参与，而且 JavaScript 本身也是一门基于事件驱动的语言。 

// 缺点：创建订阅者本身要消耗一定的时间和内存，而且当你订阅一个消息后，也许此消息最后都未发生，但这个订阅者会始终存在于内存中。另外，发布—订阅模式虽然可以弱化对象之间的联系，但如果过度使用的话，对象和对象之间的必要联系也将被深埋在背后，会导致程序难以跟踪维护和理解。特别是有多个发布者和订阅者嵌套到一起的时候，要跟踪一个 bug 不是件轻松的事情。