/* 装饰器模式 */
const Modal = (function () {
  let modal = null;
  return function () {
    if (!modal) {
      modal = document.createElement('div');
      modal.innerHTML = '您还未登录，请登录~';
      modal.id = 'modal';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    }
    return modal;
  };
})();

class OpenButton {
  onClick() {
    const modal = new Modal();
    modal.style.display = 'block';
  }
}

class Decorator {
  constructor(button) {
    /** @type {OpenButton} */
    this.button = button;
  }

  onClick() {
    this.button.onClick();
    this.changeButtonStatus();
  }

  changeButtonText() {
    const btn = document.getElementById('open');
    btn.innerText = '快去登录';
  }

  disableButton() {
    const btn = document.getElementById('open');
    btn.setAttribute('disabled', true);
  }

  changeButtonStatus() {
    this.changeButtonText();
    this.disableButton();
  }
}

const button = new OpenButton();
const decorator = new Decorator(button);

document.getElementById('open').addEventListener('click', () => {
  // openModal();
  // changeButtonStatus();
  decorator.onClick();
});
document.getElementById('close').addEventListener('click', () => {
  const modal = document.getElementById('modal');
  modal && (modal.style.display = 'none');
});

function openModal() {
  const modal = new Modal();
  modal.style.display = 'block';
}

function changeButtonText() {
  const btn = document.getElementById('open');
  btn.innerText = '快去登录';
}

function disableButton() {
  const btn = document.getElementById('open');
  btn.setAttribute('disabled', true);
}

function changeButtonStatus() {
  changeButtonText();
  disableButton();
}

function classDecorator(target) {
  target.hasDecorator = true;
  console.log('Button has been decorated.');
  return target;
}

function methodDecorator(target, name, descriptor) {
  // console.log(target, name, descriptor);
  const originalFunc = descriptor.value;
  descriptor.value = function () {
    console.log('Decorated this function.');
    return originalFunc.apply(this, arguments);
  };
  return descriptor;
}

@classDecorator
class Button {
  constructor() {
    console.log('Button.hasDecorator', Button.hasDecorator);
  }

  @methodDecorator
  onClick() {
    console.log('clicked.');
  }
}

new Button().onClick();