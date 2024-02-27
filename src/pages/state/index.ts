/* 状态模式 */
/* 状态模式的关键是区分事物内部的状态，事物内部状态的改变往往会带来事物的行为改变。 */

import { addHtml } from '../utils';

/* 
- 美式咖啡态（american)：只吐黑咖啡
- 普通拿铁态(latte)：黑咖啡加点奶
- 香草拿铁态（vanillaLatte）：黑咖啡加点奶再加香草糖浆
- 摩卡咖啡态(mocha)：黑咖啡加点奶再加点巧克力
*/

type CoffeeMakerState = 'init' | 'american' | 'latte' | 'vanillaLatte' | 'mocha';
class CoffeeMaker {
  state: CoffeeMakerState;
  leftMilk: number;
  constructor() {
    this.state = 'init';
    this.leftMilk = 500;
  }

  changeState(state: CoffeeMakerState) {
    this.state = state;
    if (state === 'american') {
      // 这里用 console 代指咖啡制作流程的业务逻辑
      console.log('我只吐黑咖啡');
    } else if (state === 'latte') {
      console.log('给黑咖啡加点奶');
    } else if (state === 'vanillaLatte') {
      console.log('黑咖啡加点奶再加香草糖浆');
    } else if (state === 'mocha') {
      console.log('黑咖啡加点奶再加点巧克力');
    }
  }

  changeState2(state: CoffeeMakerState) {
    // 记录当前状态
    this.state = state;
    if (state === 'american') {
      // 这里用 console 代指咖啡制作流程的业务逻辑
      this.americanProcess();
    } else if (state === 'latte') {
      this.latteProcess();
    } else if (state === 'vanillaLatte') {
      this.vanillaLatteProcess();
    } else if (state === 'mocha') {
      this.mochaProcess();
    }
  }

  changeState3(state: CoffeeMakerState) {
    // 记录当前状态
    this.state = state;
    this[`${state}Process`]?.();
  }

  americanProcess() {
    console.log('咖啡机现在的牛奶存储量是:', this.leftMilk, 'ml.');
    console.log('我只吐黑咖啡');
  }

  latteProcess() {
    this.americanProcess();
    console.log('加点奶');
  }

  vanillaLatteProcess() {
    this.latteProcess();
    console.log('再加香草糖浆');
  }

  mochaProcess() {
    this.latteProcess();
    console.log('再加巧克力');
  }
}
const mk = new CoffeeMaker();
mk.changeState('latte');
mk.changeState2('latte');
mk.changeState3('latte');

addHtml(`
<div id="light" style="display: block; width: 50px; height: 50px;background-color:#000;"></div>
`);

/* 电灯 */
type LightStateType = 'on' | 'off' | 'weakLight' | 'strongLight';


class LightState {
  light: Light;
  constructor(light: Light) {
    this.light = light;
  }

  btnPressed() {
    throw new Error('Should be implemented by subclass.');
  }
}

class OffLightState extends LightState {
  constructor(light: Light) {
    super(light);
  }

  btnPressed(): void {
    console.log('弱光');
    this.light.setState(this.light.weakLightState);
  }
}

class WeakLightState extends LightState {
  constructor(light: Light) {
    super(light);
  }

  btnPressed(): void {
    console.log('强光');
    this.light.setState(this.light.strongLightState);
  }
}

class StrongLightState extends LightState {
  constructor(light: Light) {
    super(light);
  }

  btnPressed(): void {
    console.log('超强光');
    this.light.setState(this.light.superStrongLightState);
  }
}

class SuperStrongLightState extends LightState {
  constructor(light: Light) {
    super(light);
  }

  btnPressed(): void {
    console.log('关灯');
    this.light.setState(this.light.offLightState);
  }
}


class Light {
  state: LightStateType;
  button: HTMLButtonElement;
  light: HTMLElement;
  lightState: LightState;
  weakLightState: WeakLightState;
  strongLightState: StrongLightState;
  superStrongLightState: SuperStrongLightState;
  offLightState: OffLightState;
  constructor() {
    this.state = 'off';
    this.button = null;
    this.light = null;
    /* 状态模式的关键是把事物的每种状态都封装成单独的类，跟此种状态有关的行为都被封装在这个类的内部 */
    this.weakLightState = new WeakLightState(this);
    this.strongLightState = new StrongLightState(this);
    this.superStrongLightState = new SuperStrongLightState(this);
    this.offLightState = new OffLightState(this);
  }

  init() {
    this.lightState = this.offLightState;

    this.light = document.getElementById('light');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = '开关';
    this.button = document.body.appendChild(btn);
    this.button.onclick = () => {
      // this.press();
      this.lightState.btnPressed();
    };
  }

  setState(lightState: LightState) {
    this.lightState = lightState;
  }

  press() {
    if (this.state === 'off') {
      this.state = 'weakLight';
      console.log('弱光');
      this.light.style.backgroundColor = 'red';
    } else if (this.state === 'weakLight') {
      this.state = 'strongLight';
      console.log('强光');
      this.light.style.backgroundColor = 'blue';
    } else if (this.state === 'strongLight') {
      this.state = 'off';
      console.log('关灯');
      this.light.style.backgroundColor = '#000';
    }
  }

}
// const l = new Light();

const FSM = {
  off: {
    buttonPressed() {
      console.log('关灯');
      this.button.innerHTML = '下一次按是弱光';
      this.state = FSM.weak;
    }
  },
  weak: {
    buttonPressed() {
      console.log('弱光');
      this.button.innerHTML = '下一次按是强光';
      this.state = FSM.strong;
    }
  },
  strong: {
    buttonPressed() {
      console.log('强光');
      this.button.innerHTML = '下一次按是超强光';
      this.state = FSM.superStrong;
    }
  },
  superStrong: {
    buttonPressed() {
      console.log('超强光');
      this.button.innerHTML = '下一次按是关灯';
      this.state = FSM.off;
    }
  },
};
type FsmType<T = typeof FSM> = {
  [K in keyof T]: T[K]
}[keyof T];

class FSMLight {
  state: FsmType;
  button: HTMLButtonElement;
  constructor() {
    this.state = FSM.off;
    this.button = null;
  }

  init() {
    const button = document.createElement('button');
    button.innerHTML = '已关灯';
    this.button = document.body.appendChild(button);
    button.onclick = () => {
      this.state.buttonPressed.call(this);
    };
  }
}

// const l = new FSMLight();

const DelegateFSM = {
  off: {
    buttonPressed() {
      console.log('关灯');
      this.button.innerHTML = '下一次按是弱光';
      this.state = this.weakState;
    }
  },
  weak: {
    buttonPressed() {
      console.log('弱光');
      this.button.innerHTML = '下一次按是强光';
      this.state = this.strongState;
    }
  },
  strong: {
    buttonPressed() {
      console.log('强光');
      this.button.innerHTML = '下一次按是超强光';
      this.state = this.superStrongState;
    }
  },
  superStrong: {
    buttonPressed() {
      console.log('超强光');
      this.button.innerHTML = '下一次按是关灯';
      this.state = this.offState;
    }
  },
};

function delegate(client: DelegateLight, delegation: FsmType<typeof DelegateFSM>) {
  return {
    btnPressed() {
      return delegation.buttonPressed.apply(client, arguments);
    }
  };
}
type DelegateType = ReturnType<typeof delegate>;
class DelegateLight {
  weakState: DelegateType;
  strongState: DelegateType;
  superStrongState: DelegateType;
  offState: DelegateType;
  button: HTMLButtonElement;
  state: DelegateType;
  constructor() {
    this.weakState = delegate(this, DelegateFSM.weak);
    this.strongState = delegate(this, DelegateFSM.strong);
    this.superStrongState = delegate(this, DelegateFSM.superStrong);
    this.state = this.offState = delegate(this, DelegateFSM.off);
    this.button = null;
  }
  init() {
    const button = document.createElement('button');
    button.innerHTML = '已关灯';
    this.button = document.body.appendChild(button);
    this.button.onclick = () => {
      this.state.btnPressed();
    };
  }
}

const l = new DelegateLight();

l.init();

/* 文件上传 */
/* 文件上传程序中有扫描、正在上传、暂停、上传成功、上传失败这几种状态，音乐
播放器可以分为加载中、正在播放、暂停、播放完毕这几种状态 */
/* 
- 文件在扫描状态中，是不能进行任何操作的，既不能暂停也不能删除文件，只能等待扫
描完成。扫描完成之后，根据文件的 md5 值判断，若确认该文件已经存在于服务器，则
直接跳到上传完成状态。如果该文件的大小超过允许上传的最大值，或者该文件已经损
坏，则跳往上传失败状态。剩下的情况下才进入上传中状态。
- 上传过程中可以点击暂停按钮来暂停上传，暂停后点击同一个按钮会继续上传。
- 扫描和上传过程中，点击删除按钮无效，只有在暂停、上传完成、上传失败之后，才能
删除文件。
*/

type UploadState = 'sign' | 'uploading' | 'pause' | 'done' | 'error' | 'del';

class UploadPlugin {
  dom: HTMLEmbedElement;
  constructor() {
    this.dom = document.createElement('embed');
    this.dom.style.display = 'none';
    this.dom.type = 'application/txftn-webkit';
    document.body.appendChild(this.dom);
  }

  sign() {
    console.log('开始文件传输');
  }

  pause() {
    console.log('暂停文件上传');
  }

  uploading() {
    console.log('开始文件上传');
  }

  del() {
    console.log('删除文件上传');
  }

  done() {
    console.log('文件上传完成');
  }
}

class State {
  uploadObj: Upload;
  constructor(uploadObj: Upload) {
    if (new.target === State) {
      throw new Error('抽象类不可实例化');
    }
    this.uploadObj = uploadObj;
  }
  clickHandler1() {
    throw new Error('子类必须重写父类的clickHandler1方法');
  }

  clickHandler2() {
    throw new Error('子类必须重写父类的clickHandler2方法');
  }
}

class SignState extends State {
  constructor(uploadObj: Upload) {
    super(uploadObj);
  }
  clickHandler1(): void {
    console.log('扫描中，点击无效...');
  }
  clickHandler2(): void {
    console.log('文件正在上传中，不能删除');
  }
}

class UploadingState extends State {
  constructor(uploadObj: Upload) {
    super(uploadObj);
  }
  clickHandler1(): void {
    this.uploadObj.pause();
  }
  clickHandler2(): void {
    console.log('文件正在上传中，不能删除');
  }
}

class PauseState extends State {
  constructor(uploadObj: Upload) {
    super(uploadObj);
  }
  clickHandler1(): void {
    this.uploadObj.uploading();
  }
  clickHandler2(): void {
    this.uploadObj.del();
  }
}

class DoneState extends State {
  constructor(uploadObj: Upload) {
    super(uploadObj);
  }
  clickHandler1(): void {
    console.log('文件已完成上传，点击无效');
  }
  clickHandler2(): void {
    this.uploadObj.del();
  }
}

class ErrorState extends State {
  constructor(uploadObj: Upload) {
    super(uploadObj);
  }
  clickHandler1(): void {
    console.log('文件上传失败, 点击无效');
  }
  clickHandler2(): void {
    this.uploadObj.del();
  }
}

class Upload {
  plugin: UploadPlugin;
  filename: string;
  button1: HTMLButtonElement;
  button2: HTMLButtonElement;
  state: UploadState;
  dom: HTMLElement;
  signState: SignState;
  uploadingState: UploadingState;
  pauseState: PauseState;
  doneState: DoneState;
  errorState: ErrorState;
  currentState: State;
  constructor(filename: string) {
    this.plugin = new UploadPlugin();
    this.filename = filename;
    this.button1 = null;
    this.button2 = null;
    this.state = 'sign';
    this.signState = new SignState(this);
    this.uploadingState = new UploadingState(this);
    this.pauseState = new PauseState(this);
    this.doneState = new DoneState(this);
    this.errorState = new ErrorState(this);
    this.currentState = this.signState;
  }

  init() {
    this.dom = document.createElement('div');
    this.dom.innerHTML = `
      <span>文件名称：${this.filename}</span>
      <button data-action="button1">扫描中</button>
      <button data-action="button2">删除</button>
    `;
    document.body.appendChild(this.dom);
    this.button1 = this.dom.querySelector('[data-action="button1"]');
    this.button2 = this.dom.querySelector('[data-action="button2"]');
    this.bindEvent();
  }

  bindEvent() {
    this.button1.onclick = () => {
      this.currentState.clickHandler1();
      /* if (this.state === 'sign') { // 扫描状态下，任何操作无效
        console.log('扫描中，点击无效...');
      } else if (this.state === 'uploading') { // 上传中，点击切换到暂停
        this.changeState('pause');
      } else if (this.state === 'pause') { // 暂停中，点击切换到上传中
        this.changeState('uploading');
      } else if (this.state === 'done') {
        console.log('文件已完成上传, 点击无效');
      } else if (this.state === 'error') {
        console.log('文件上传失败, 点击无效');
      } */
    };

    this.button2.onclick = () => {
      this.currentState.clickHandler2();
      /* if (this.state === 'done' || this.state === 'error'
        || this.state === 'pause') {
        // 上传完成、上传失败和暂停状态下可以删除
        this.changeState('del');
      } else if (this.state === 'sign') {
        console.log('文件正在扫描中，不能删除');
      } else if (this.state === 'uploading') {
        console.log('文件正在上传中，不能删除');
      } */
    };
  }

  changeState(state: UploadState) {
    switch (state) {
      case 'sign':
        this.plugin.sign();
        this.button1.innerHTML = '扫描中，任何操作无效';
        break;
      case 'uploading':
        this.plugin.uploading();
        this.button1.innerHTML = '正在上传，点击暂停';
        break;
      case 'pause':
        this.plugin.pause();
        this.button1.innerHTML = '已暂停，点击继续上传';
        break;
      case 'done':
        this.plugin.done();
        this.button1.innerHTML = '上传完成';
        break;
      case 'error':
        this.button1.innerHTML = '上传失败';
        break;
      case 'del':
        this.plugin.del();
        this.dom.parentNode.removeChild(this.dom);
        console.log('删除完成');
        break;
      default: break;
    }
    this.state = state;
  }

  sign() {
    this.plugin.sign();
    this.currentState = this.signState;
  }

  uploading() {
    this.button1.innerHTML = '正在上传，点击暂停';
    this.plugin.uploading();
    this.currentState = this.uploadingState;
  }

  pause() {
    this.button1.innerHTML = '已暂停，点击继续上传';
    this.plugin.pause();
    this.currentState = this.pauseState;
  }

  done() {
    this.button1.innerHTML = '上传完成';
    this.plugin.done();
    this.currentState = this.doneState;
  }

  error() {
    this.button1.innerHTML = '上传失败';
    this.currentState = this.errorState;
  }

  del() {
    this.plugin.del();
    this.dom.parentNode.removeChild(this.dom);
    console.log('删除完成');
  }
}


const uploadObj = new Upload('JavaScript 设计模式与开发实践.pdf');

uploadObj.init();

function doUpload(state: UploadState) {
  // uploadObj.changeState(state);
  uploadObj[state]();
}

doUpload('sign');

setTimeout(() => {
  doUpload('uploading');
}, 1000);

setTimeout(() => {
  doUpload('done');
}, 5000);

/* 基于表驱动的状态机 */