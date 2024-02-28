/* 中介者模式 */
/* 中介者模式的作用就是解除对象与对象之间的紧耦合关系。增加一个中介者对象后，所有的
相关对象都通过中介者对象来通信，而不是互相引用，所以当一个对象发生改变时，只需要通知
中介者对象即可。中介者使各对象之间耦合松散，而且可以独立地改变它们之间的交互。中介者模式使网状的多对多关系变成了相对简单的一对多关系 */

/* 机场指挥塔、博彩公司 */

/* 泡泡堂 */

function simulate1() {
  class Player {
    name: string;
    enemy: Player = null;
    constructor(name: string) {
      this.name = name;
    }
    win() {
      console.log(this.name + ' won.');
    }
    lose() {
      console.log(this.name + ' lost.');
    }
    die() {
      this.lose();
      this.enemy.win();
    }
  }
  const player1 = new Player('A');
  const player2 = new Player('B');
  player1.enemy = player2;
  player2.enemy = player1;
  player1.die();
}
// simulate1();

function simulate2() {
  const players = [];
  type PlayerState = 'live' | 'dead';
  class Player {
    name: string;
    teamColor: string;
    state: PlayerState;
    partners: Player[] = [];
    enemies: Player[] = [];
    constructor(name: string, teamColor: string) {
      this.name = name;
      this.teamColor = teamColor;
      this.state = 'live';
    }
    win() {
      console.log('winner: ' + this.name);
    }
    lose() {
      console.log('loser: ' + this.name);
    }
    die() {
      let allDead = true;
      this.state = 'dead';
      for (let i = 0, partner: Player; partner = this.partners[i]; i += 1) {
        if (partner.state !== 'dead') {
          allDead = false;
          break;
        }
      }
      if (allDead) {
        this.lose();
        for (let i = 0, partner: Player; partner = this.partners[i]; i += 1) {
          partner.lose();
        }
        for (let i = 0, enemy: Player; enemy = this.enemies[i]; i += 1) {
          enemy.win();
        }
      }
    }
  }
  function playerFactory(name: string, teamColor: string) {
    const newPlayer = new Player(name, teamColor);
    for (let i = 0, player: Player; player = players[i]; i += 1) {
      if (player.teamColor === newPlayer.teamColor) {
        player.partners.push(newPlayer);
        newPlayer.partners.push(player);
      } else {
        player.enemies.push(newPlayer);
        newPlayer.enemies.push(player);
      }
    }
    players.push(newPlayer);
    return newPlayer;
  }
  //红队：
  const player1 = playerFactory('皮蛋', 'red'),
    player2 = playerFactory('小乖', 'red'),
    player3 = playerFactory('宝宝', 'red'),
    player4 = playerFactory('小强', 'red');
  //蓝队：
  let player5 = playerFactory('黑妞', 'blue'),
    player6 = playerFactory('葱头', 'blue'),
    player7 = playerFactory('胖墩', 'blue'),
    player8 = playerFactory('海盗', 'blue');

  player1.die();
  player2.die();
  player4.die();
  setTimeout(() => {
    player3.die();
  }, 1000);
}
// simulate2();

/* 用中介者模式改造泡泡堂游戏 */
function simulate3() {
  type PlayerState = 'live' | 'dead';
  class Player {
    name: string;
    teamColor: string;
    state: PlayerState;
    constructor(name: string, teamColor: string) {
      this.name = name;
      this.teamColor = teamColor;
      this.state = 'live';
    }
    win() {
      console.log(this.name + ' won.');
    }
    lose() {
      console.log(this.name + ' lost.');
    }
    die() {
      this.state = 'dead';
      playerDirector.receiveMessage('playerDead', this);
    }
    remove() {
      playerDirector.receiveMessage('removePlayer', this);
    }
    changeTeam(color: string) {
      playerDirector.receiveMessage('changeTeam', this, color);
    }
  }
  function playerFactory(name: string, teamColor: string) {
    const newPlayer = new Player(name, teamColor);
    playerDirector.receiveMessage('addPlayer', newPlayer);
    return newPlayer;
  }
  type MessageType = Exclude<keyof PlayerDirector, 'players' | 'receiveMessage'>;
  class PlayerDirector {
    players: Record<string, Player[]> = {};

    addPlayer(player: Player) {
      const teamColor = player.teamColor;
      this.players[teamColor] = this.players[teamColor] || [];
      this.players[teamColor].push(player);
    }

    removePlayer(player: Player) {
      const teamColor = player.teamColor;
      const teamPlayers = this.players[teamColor] || [];
      for (let i = teamPlayers.length - 1; i >= 0; i -= 1) {
        if (teamPlayers[i] === player) {
          teamPlayers.splice(i, 1);
        }
      }
    }

    changeTeam(player: Player, newTeamColor: string) {
      this.removePlayer(player);
      player.teamColor = newTeamColor;
      this.addPlayer(player);
    }

    playerDead(player: Player) {
      const teamColor = player.teamColor;
      const teamPlayers = this.players[teamColor] || [];
      let allDead = true;
      for (let i = 0, _player: Player; _player = teamPlayers[i]; i += 1) {
        if (_player.state !== 'dead') {
          allDead = false;
          break;
        }
      }
      if (allDead) {
        for (let i = 0, _player: Player; _player = teamPlayers[i]; i += 1) {
          _player.lose();
        }
        for (const color in this.players) {
          if (color !== teamColor) {
            const teamPlayers = this.players[color];
            for (let i = 0, _player: Player; _player = teamPlayers[i]; i += 1) {
              _player.win();
            }
          }
        }
      }
    }

    receiveMessage(type: MessageType, ...rest: any[]) {
      this[type].apply(this, rest);
    }
  }
  const playerDirector = new PlayerDirector();
  //红队：
  const player1 = playerFactory('皮蛋', 'red'),
    player2 = playerFactory('小乖', 'red'),
    player3 = playerFactory('宝宝', 'red'),
    player4 = playerFactory('小强', 'red');
  //蓝队：
  let player5 = playerFactory('黑妞', 'blue'),
    player6 = playerFactory('葱头', 'blue'),
    player7 = playerFactory('胖墩', 'blue'),
    player8 = playerFactory('海盗', 'blue');

  // player1.die();
  // player2.die();
  // player1.remove();
  player1.changeTeam('blue');
  player2.remove();
  player4.die();
  setTimeout(() => {
    player3.die();
  }, 2000);
}
// simulate3();

/* 中介者模式 购买商铺 */
function simulate4() {
  const goods = {
    "red|32G|800": 3, // 颜色 red，内存 32G，cpu800，对应库存数量为 3
    "red|16G|801": 0,
    "blue|32G|800": 1,
    "blue|16G|801": 6
  };

  const colorSelect = document.getElementById('colorSelect') as HTMLSelectElement;
  const memorySelect = document.getElementById('memorySelect') as HTMLSelectElement;
  const cpuSelect = document.getElementById('cpuSelect') as HTMLSelectElement;
  const numberInput = document.getElementById('numberInput') as HTMLInputElement;
  const colorInfo: HTMLElement = document.getElementById('colorInfo');
  const memoryInfo: HTMLElement = document.getElementById('memoryInfo');
  const cpuInfo: HTMLElement = document.getElementById('cpuInfo');
  const numberInfo: HTMLElement = document.getElementById('numberInfo');
  const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;

  colorSelect.onchange = function () {
    const color = colorSelect.value;
    const memory = memorySelect.value;
    let number = +numberInput.value;
    const stock = goods[`${color}|${memory}`];
    colorInfo.innerHTML = color;
    if (!color) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = '请选择手机颜色';
      return;
    }
    if (!memory) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = '请选择内存大小';
      return;
    }
    if (((number - 0) | 0) !== (number - 0) || number === 0) { // 用户输入的购买数量是否为正整数
      nextBtn.disabled = true;
      nextBtn.innerHTML = '请输入正确的购买数量';
      return;
    }
    if (number > stock) { // 当前选择数量没有超过库存量
      nextBtn.disabled = true;
      nextBtn.innerHTML = '库存不足';
      return;
    }
    nextBtn.disabled = false;
    nextBtn.innerHTML = '放入购物车';
  };

  memorySelect.onchange = function () {
    const color = colorSelect.value;
    const memory = memorySelect.value;
    let number = +numberInput.value;
    const stock = goods[`${color}|${memory}`];
    memoryInfo.innerHTML = memory;
    if (!color) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = '请选择手机颜色';
      return;
    }
    if (!memory) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = '请选择内存大小';
      return;
    }
    if (((number - 0) | 0) !== (number - 0) || number === 0) { // 用户输入的购买数量是否为正整数
      nextBtn.disabled = true;
      nextBtn.innerHTML = '请输入正确的购买数量';
      return;
    }
    if (number > stock) { // 当前选择数量没有超过库存量
      nextBtn.disabled = true;
      nextBtn.innerHTML = '库存不足';
      return;
    }
    nextBtn.disabled = false;
    nextBtn.innerHTML = '放入购物车';
  };

  numberInput.oninput = function () {
    const color = colorSelect.value;
    const memory = memorySelect.value;
    let number = +numberInput.value;
    const stock = goods[`${color}|${memory}`];
    numberInfo.innerHTML = color;

    if (!color) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = '请选择手机颜色';
      return;
    }
    if (!memory) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = '请选择内存大小';
      return;
    }
    if (((number - 0) | 0) !== (number - 0) || number === 0) { // 用户输入的购买数量是否为正整数
      nextBtn.disabled = true;
      nextBtn.innerHTML = '请输入正确的购买数量';
      return;
    }
    if (number > stock) { // 当前选择数量没有超过库存量
      nextBtn.disabled = true;
      nextBtn.innerHTML = '库存不足';
      return;
    }
    nextBtn.disabled = false;
    nextBtn.innerHTML = '放入购物车';
  };

  /* 引入中介者 */
  const mediator = (function () {
    return {
      changed(obj) {
        const color = colorSelect.value;
        const memory = memorySelect.value;
        const cpu = cpuSelect.value;
        let number = +numberInput.value;
        const stock = goods[`${color}|${memory}|${cpu}`];

        if (obj === colorSelect) {
          colorInfo.innerHTML = color;
        } else if (obj === memorySelect) {
          memoryInfo.innerHTML = memory;
        } else if (obj === cpuSelect) {
          cpuInfo.innerHTML = cpu;
        } else if (obj === numberInput) {
          numberInfo.innerHTML = '' + number;
        }
        if (!color) {
          nextBtn.disabled = true;
          nextBtn.innerHTML = '请选择手机颜色';
          return;
        }
        if (!memory) {
          nextBtn.disabled = true;
          nextBtn.innerHTML = '请选择内存大小';
          return;
        }
        if (!cpu) {
          nextBtn.disabled = true;
          nextBtn.innerHTML = '请选择CPU型号';
          return;
        }
        if (((number - 0) | 0) !== (number - 0) || number === 0) { // 用户输入的购买数量是否为正整数
          nextBtn.disabled = true;
          nextBtn.innerHTML = '请输入正确的购买数量';
          return;
        }
        if (number > stock) { // 当前选择数量没有超过库存量
          nextBtn.disabled = true;
          nextBtn.innerHTML = '库存不足';
          return;
        }
        nextBtn.disabled = false;
        nextBtn.innerHTML = '放入购物车';
      }
    };
  })();
  colorSelect.onchange = function () {
    mediator.changed(this);
  };
  memorySelect.onchange = function () {
    mediator.changed(this);
  };
  cpuSelect.onchange = function () {
    mediator.changed(this);
  };
  numberInput.oninput = function () {
    mediator.changed(this);
  };
}
simulate4();


/* 中介者模式使各个对象之间得以解耦，以中介者和对象之间的一对多关系取代了对象
之间的网状多对多关系。各个对象只需关注自身功能的实现，对象之间的交互关系交给了中介者
对象来实现和维护。 */
/* 
最大的缺点是系统中会新增一个中介者对象，因
为对象之间交互的复杂性，转移成了中介者对象的复杂性，使得中介者对象经常是巨大的。中介
者对象自身往往就是一个难以维护的对象
*/