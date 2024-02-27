/* 策略模式 */
// 定义一系列的算法，把它们一个个封装起来，并且使它们可以相互替换。

import { addHtml, addLabel } from '../utils';

/*
 * 当价格类型为“预售价”时，满 100 - 20，不满 100 打 9 折\
 * 当价格类型为“大促价”时，满 100 - 30，不满 100 打 8 折\
 * 当价格类型为“返场价”时，满 200 - 50，不叠加\
 * 当价格类型为“尝鲜价”时，直接打 5 折\
 * 
 * 询价方法，接受价格标签和原价为入参
 */
function askPrice1(tag, originPrice) {

  // 处理预热价
  if (tag === 'pre') {
    if (originPrice >= 100) {
      return originPrice - 20;
    }
    return originPrice * 0.9;
  }

  // 处理大促价
  if (tag === 'onSale') {
    if (originPrice >= 100) {
      return originPrice - 30;
    }
    return originPrice * 0.8;
  }

  // 处理返场价
  if (tag === 'back') {
    if (originPrice >= 200) {
      return originPrice - 50;
    }
    return originPrice;
  }

  // 处理尝鲜价
  if (tag === 'fresh') {
    return originPrice * 0.5;
  }
}

// 处理预热价
function prePrice(originPrice) {
  if (originPrice >= 100) {
    return originPrice - 20;
  }
  return originPrice * 0.9;
}

// 处理大促价
function onSalePrice(originPrice) {
  if (originPrice >= 100) {
    return originPrice - 30;
  }
  return originPrice * 0.8;
}

// 处理返场价
function backPrice(originPrice) {
  if (originPrice >= 200) {
    return originPrice - 50;
  }
  return originPrice;
}

// 处理尝鲜价
function freshPrice(originPrice) {
  return originPrice * 0.5;
}

// 处理新人价
function newUserPrice(originPrice) {
  if (originPrice >= 100) {
    return originPrice - 50;
  }
  return originPrice;
}

function askPrice2(tag, originPrice) {
  // 处理预热价
  if (tag === 'pre') {
    return prePrice(originPrice);
  }
  // 处理大促价
  if (tag === 'onSale') {
    return onSalePrice(originPrice);
  }

  // 处理返场价
  if (tag === 'back') {
    return backPrice(originPrice);
  }

  // 处理尝鲜价
  if (tag === 'fresh') {
    return freshPrice(originPrice);
  }

  // 处理新人价
  if (tag === 'newUser') {
    return newUserPrice(originPrice);
  }
}

const priceProcessor = {
  prePrice,
  onSalePrice,
  backPrice,
  freshPrice,
  newUserPrice,
};

/**
 * 
 * @param {keyof typeof priceProcessor} tag 
 * @param {number} originPrice 
 * @returns {number}
 */
function askPrice(tag, originPrice) {
  return console.log(priceProcessor[tag](originPrice));
}


askPrice('backPrice', 100);

addLabel('使用策略模式实现缓动动画');
addHtml(`
<div style="position: relative; width: 100%; height: 60px">
  <div
    id="cube"
    style="
      position: absolute;
      background-color: blue;
      width: 50px;
      height: 50px;
      border-radius: 100px;
      text-align: center;
      line-height: 50px;
    "
  >
    Cube
  </div>
</div>
`);

/**
 * 这些算法都接受 4 个参数，这 4 个参数的含义分别是
 * @param {number} t 动画已消耗的时间
 * @param {number} b 小球原始位置
 * @param {number} c 小球目标位置
 * @param {number} d 动画持续的总时间
 * @return {number} 动画元素应该处在的当前位置
 */
type TweenMethod = (t: number, b: number, c: number, d: number) => number;

type TweenEasing =
  | 'linear'
  | 'easeIn'
  | 'strongEaseIn'
  | 'strongEaseOut'
  | 'sinEaseIn'
  | 'sinEaseOut';

type Tween = Record<TweenEasing, TweenMethod>;

const tween: Tween = {
  linear(t, b, c, d) { return c * t / d + b; },
  easeIn(t, b, c, d) { return c * (t /= d) * t + b; },
  strongEaseIn(t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
  },
  strongEaseOut(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
  },
  sinEaseIn(t, b, c, d) { return c * (t /= d) * t * t + b; },
  sinEaseOut(t, b, c, d) { return c * ((t = t / d - 1) * t * t + 1) + b; },
};

type Equal<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;
type WritableKeys<T> = {
  [P in keyof T]-?: Equal<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P
  >;
}[keyof T];

type PropertyName<T = CSSStyleDeclaration> = keyof Pick<T, WritableKeys<T>> & string;

class Animate {
  dom: HTMLElement;
  startTime: number;
  startPos: number;
  endPos: number;
  propertyName: PropertyName | null;
  easing: TweenMethod | null;
  duration: number | null;
  rafId: number;

  constructor(dom: HTMLElement) {
    this.dom = dom;           // 进行运动的 dom 节点
    this.startTime = 0;       // 动画开始时间
    this.startPos = 0;        // 动画开始时，dom 节点的位置，即 dom 的初始位置
    this.endPos = 0;          // 动画结束时，dom 节点的位置，即 dom 的目标位置
    this.propertyName = null; // dom 节点需要被改变的 CSS 属性名
    this.easing = null;       // 缓动算法
    this.duration = null;     // 动画持续时间
  }

  /**
   * 负责启动这个动画，在动画被启动的瞬间，要记录一些信息，
   * 供缓动算法在以后计算小球当前位置的时候使用。
   * 在记录完这些信息之后，此方法还要负责启动定时器
   * @param propertyName 要改变的 CSS 属性名，比如'left'、'top'，分别表示左右移动和上下移动
   * @param endPos 小球运动的目标位置
   * @param duration 动画持续时间
   * @param easing 缓动算法
   */
  start(propertyName: PropertyName, endPos: number, duration: number, easing: TweenEasing) {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.startTime = +new Date();                      // 动画启动时间
    this.startPos =
      this.dom.getBoundingClientRect()[propertyName]; // dom节点初始位置
    this.propertyName = propertyName;             // dom节点需要被改变的CSS属性名
    this.endPos = endPos;                             // dom节点目标位置
    this.duration = duration;                         // 动画持续时间
    this.easing = tween[easing];                      // 缓动算法

    const run = () => {
      this.rafId = requestAnimationFrame(run);
      if (this.step() === false) {
        cancelAnimationFrame(this.rafId);
      }
    };
    run();
  }

  /**
   * 代表小球运动的每一帧要做的事情
   * 法负责计算小球的当前位置和调用更新 CSS 属性值的update方法
   */
  step() {
    const t = +new Date();                      // 取得当前时间
    if (t >= this.startTime + this.duration!) {  // 说明动画已结束，修正小球位置
      this.update(this.endPos);                 // 更新小球的CSS属性值
      return false;
    }
    const pos = this.easing!(t - this.startTime, this.startPos, this.endPos - this.startPos, this.duration!);             // pos为小球当前位置
    this.update(pos);                           // 更新小球的CSS属性值
  }

  /**
   * 负责更新小球 CSS 属性值
   * @param pos 位置
   */
  update(pos: number) {
    this.dom.style.setProperty(this.propertyName!, pos + 'px');
  }
}
function animateCube() {
  const cube = document.getElementById('cube')!;
  const animate = new Animate(cube);

  animate.start('left', 500, 1000, 'linear');

  const btns = Object.keys(tween).reduce((wrapper, key) => {
    const btn = document.createElement('button');
    btn.id = key;
    btn.type = 'button';
    btn.textContent = key[0].toUpperCase() + key.slice(1);
    wrapper.append('\t', btn);
    return wrapper;
  }, document.createElement('div'));
  btns.id = 'btnWrapper';
  btns.onclick = (e) => {
    cube.style.left = '0px';
    const easing = (e.target as HTMLButtonElement).id as TweenEasing;
    console.log('easing :>>', easing);
    animate.start('left', 500, 1000, easing);
  };

  document.body.appendChild(btns);
}

animateCube();

addLabel('使用策略模式实现表单校验');

addHtml(`
<form action="#" id="registerForm" method="post">
  <label>请输入用户名&emsp;: <input type="text" name="userName"/ ></label><br />
  <label>请输入密码&emsp;&emsp;: <input type="text" name="password"/ ></label><br />
  <label>请输入手机号码: <input type="text" name="phoneNumber"/ ></label><br />
  <button>提交</button>
</form>
`);

const form = document.getElementById('registerForm')!;

/* 
// 函数庞大，缺乏弹性，违反开放封闭原则，复用性差
form.onsubmit = () => {
  if (form.userName.value === '') {
    console.log('用户名不能为空!');
    return false;
  }
  if (form.password.value.length < 6) {
    console.log('密码长度不能少于6位!');
    return false;
  }
  if (!/(^1[3|5|8][0-9]{9}$)/.test(registerForm.phoneNumber.value)) {
    console.log('手机号码格式不正确!');
    return false;
  }
};
 */

const validations = {
  isNotEmpty(value: string, errorMsg: string) {
    if (value === '') return errorMsg;
  },
  isMobile(value: string, errorMsg: string) {
    if (!/(^1[3|5|8][0-9]{9}$)/.test(value)) return errorMsg;
  },
  minLength(value: string, errorMsg: string, length: number) {
    if (value.length < length) return errorMsg;
  }
};

type Validations = typeof validations;
type ValueOf<T> = {
  [K in keyof T]: T[K]
}[keyof T];
type ValidationMethods = ValueOf<Validations>;
type GetValidationRuleParamType<T = ValidationMethods> = T extends (v: string, m: string, p: infer P) => string | void ? P : never;
type GetValidationRules<T extends Validations> = {
  [K in keyof T]: GetValidationRuleParamType<T[K]> extends string | number ? `${K & string}:${GetValidationRuleParamType<T[K]>}` : K;
}[keyof T];
type ValidationMethodNames = GetValidationRules<Validations>;
type ValidationRule = { rule: ValidationMethodNames, errorMsg: string; };

class Validator {
  cache: (() => ValidationMethods)[];
  form: HTMLElement | HTMLFormElement;
  constructor(form: HTMLElement | HTMLFormElement) {
    this.cache = [];
    this.form = form;
  }

  add(domName: string, rules: ValidationRule[]) {
    let ruleArg: ValidationRule;
    for (let i = 0; ruleArg = rules[i]; i += 1) {
      const rule = ruleArg.rule.split(':');
      const errorMsg = ruleArg.errorMsg;
      this.cache.push(() => {
        const strategy = rule.shift() as ValidationMethodNames;
        const dom = this.form[domName];
        rule.unshift(errorMsg);
        rule.unshift(dom.value);
        return validations[strategy].apply(dom, rule);
      });
    }
  }

  start() {
    let validate: () => ValidationMethods;
    for (let i = 0; validate = this.cache[i]; i += 1) {
      const msg = validate();
      if (msg) {
        return msg;
      }
    }
  }
}



form.validate = () => {
  const validator = new Validator(form);
  validator.add('userName', [
    {
      rule: 'isNotEmpty',
      errorMsg: '用户名不能为空!',
    },
    {
      rule: 'minLength:10',
      errorMsg: '用户名长度不能小于 10 位!',
    },
  ]);
  validator.add('password', [{
    rule: 'minLength:6',
    errorMsg: '密码长度不能少于 6 位!'
  }]);
  validator.add('phoneNumber', [{
    rule: 'isMobile',
    errorMsg: '手机号码格式不正确!'
  }]);

  return validator.start();
};

form.onsubmit = () => {
  const errorMsg = form.validate();
  if (errorMsg) {
    console.log('errorMsg :>>', errorMsg);
    return false;
  }
};