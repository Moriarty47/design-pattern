/* 命令模式 */
/* 命令模式是最简单和优雅的模式之一，命令模式中的命令（command）指的是一个执行某些
特定事情的指令 */
/* 有时候需要向某些对象发送请求，但是并不知道请求的接收
者是谁，也不知道被请求的操作是什么。此时希望用一种松耦合的方式来设计程序，使得请求发送者和请求接收者能够消除彼此之间的耦合关系。 */

import { Animate } from '../strategy';

/* 菜单程序 */

const [btn1, btn2, btn3] = document.querySelectorAll('button');

function setCommand(btn: HTMLButtonElement, command: Command) {
  btn.onclick = function () {
    command.execute();
  };
}

const MenuBar = {
  refresh() {
    console.log('刷新菜单目录');
  }
};

const SubMenu = {
  add() {
    console.log('增加子菜单');
  },
  del() {
    console.log('删除子菜单');
  }
};

type Receiver = Partial<typeof MenuBar & typeof SubMenu & Animate>;

class Command<T = Receiver> {
  receiver: T;
  constructor(receiver?: T) {
    this.receiver = receiver;
  }
  execute() { }
  undo() { }
}
class RefreshMenuBarCommand extends Command {
  constructor(receiver: Receiver) {
    super(receiver);
  }
  execute(): void {
    this.receiver.refresh();
  }
}
class AddSubMenuCommand extends Command {
  constructor(receiver: Receiver) {
    super(receiver);
  }
  execute(): void {
    this.receiver.add();
  }
}
class DelSubMenuCommand extends Command {
  constructor(receiver: Receiver) {
    super(receiver);
  }
  execute(): void {
    this.receiver.del();
  }
}
setCommand(btn1, new RefreshMenuBarCommand(MenuBar));
setCommand(btn2, new AddSubMenuCommand(SubMenu));
setCommand(btn3, new DelSubMenuCommand(SubMenu));

const ball = document.getElementById('ball');
const pos = document.getElementById('pos') as HTMLInputElement;
const moveBtn = document.getElementById('moveBtn');
const cancelBtn = document.getElementById('cancelBtn');

const animate = new Animate(ball);
class MoveCommand extends Command {
  pos: number;
  oldPos: number;
  constructor(receiver: Receiver, pos: number) {
    super(receiver);
    this.pos = pos;
    this.oldPos = null;
  }
  execute(): void {
    this.receiver.start('left', this.pos, 1000, 'strongEaseOut');
    this.oldPos = this.receiver.dom.getBoundingClientRect()[this.receiver.propertyName];
  }
  undo(): void {
    this.receiver.start('left', this.oldPos, 1000, 'strongEaseOut');
  }
}
let moveCommand;
moveBtn.onclick = () => {
  // animate.start('left', +pos.value, 1000, 'strongEaseOut');
  moveCommand = new MoveCommand(animate, +pos.value);
  moveCommand.execute();
};
cancelBtn.onclick = () => {
  moveCommand.undo();
};


const Ryu = {
  attack() { console.log('攻击'); },
  defense() { console.log('防御'); },
  jump() { console.log('跳跃'); },
  crouch() { console.log('蹲下'); },
};

const commands = {
  119: 'jump',
  115: 'crouch',
  97: 'defense',
  100: 'attack'
} as const;

type ValueOf<T> = {
  [K in keyof T]: T[K]
}[keyof T];

function makeCommand(receiver: typeof Ryu, state: ValueOf<typeof commands>) {
  return receiver[state] ? () => receiver[state]() : false;
}

const commandStack = [];
document.addEventListener('keypress', e => {
  const { keyCode } = e;
  const command = makeCommand(Ryu, commands[keyCode]);
  if (command) {
    command();
    commandStack.push(command);
  }
});

document.getElementById('replay').onclick = function () {
  let command: ReturnType<typeof makeCommand>;
  while (command = commandStack.shift()) {
    command();
  }
};

/* 宏命令 */
/* 宏命令是一组命令的集合，通过执行宏命令的方式，可以一次执行一批命令 */

class CloseDoorCommand extends Command {
  constructor() {
    super();
  }
  execute(): void {
    console.log('关门');
  }
  undo(): void {
    console.log('开门');
  }
}
class OpenPcCommand extends Command {
  constructor() {
    super();
  }
  execute(): void {
    console.log('开电脑');
  }
  undo(): void {
    console.log('关电脑');
  }
}
class OpenQQCommand extends Command {
  constructor() {
    super();
  }
  execute(): void {
    console.log('登录QQ');
  }
  undo(): void {
    console.log('退出QQ');
  }
}
class MarcoCommand extends Command {
  commandsList: Command[] = [];
  constructor() {
    super();
  }
  add(command: Command) {
    this.commandsList.push(command);
  }
  execute(): void {
    for (let i = 0, command: Command; command = this.commandsList[i]; i += 1) {
      command.execute();
    }
  }
  undo(): void {
    let command: Command;
    while (command = this.commandsList.pop()) {
      command.undo();
    }
  }
}
const marcoCommand = new MarcoCommand();
marcoCommand.add(new CloseDoorCommand());
marcoCommand.add(new OpenPcCommand());
marcoCommand.add(new OpenQQCommand());
marcoCommand.execute();
marcoCommand.undo();

/* 智能命令和傻瓜命令 */
