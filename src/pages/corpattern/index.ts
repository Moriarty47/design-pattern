/* 职责链模式 */
/* 使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间的耦合关系，将这些对象连成一条链，并沿着这条链传递该请求，直到有一个对象处理它为止 */

/* 
orderType：表示订单类型（定金用户或者普通购买用户），code 的值为 1 的时候是 500 元
定金用户，为 2 的时候是 200 元定金用户，为 3 的时候是普通购买用户。
pay：表示用户是否已经支付定金，值为 true 或者 false, 虽然用户已经下过 500 元定金的
订单，但如果他一直没有支付定金，现在只能降级进入普通购买模式。
stock：表示当前用于普通购买的手机库存数量，已经支付过 500 元或者 200 元定金的用
户不受此限制。
*/
type OrderFn = (orderType: 1 | 2 | 3, pay: boolean, stock: number) => 'nextSuccessor' | (string & {}) | void;
function simulate1() {
  const order: OrderFn = (orderType, pay, stock) => {
    if (orderType === 1) { // 500 元定金购买模式
      if (pay === true) { // 已支付定金
        console.log('500 元定金预购, 得到 100 优惠券');
      } else { // 未支付定金，降级到普通购买模式
        if (stock > 0) { // 用于普通购买的手机还有库存
          console.log('普通购买, 无优惠券');
        } else {
          console.log('手机库存不足');
        }
      }
    }
    else if (orderType === 2) { // 200 元定金购买模式
      if (pay === true) {
        console.log('200 元定金预购, 得到 50 优惠券');
      } else {
        if (stock > 0) {
          console.log('普通购买, 无优惠券');
        } else {
          console.log('手机库存不足');
        }
      }
    }
    else if (orderType === 3) {
      if (stock > 0) {
        console.log('普通购买, 无优惠券');
      } else {
        console.log('手机库存不足');
      }
    }
  };
  order(1, true, 500); // 输出： 500 元定金预购, 得到 100 优惠券
}
// simulate1();

function simulate2() {
  const orderNormal: OrderFn = (orderType, pay, stock) => {
    if (stock > 0) {
      console.log('普通购买, 无优惠券');
    } else {
      console.log('手机库存不足');
    }
  };
  const order200: OrderFn = (orderType, pay, stock) => {
    if (orderType === 2 && pay === true) {
      console.log('200 元定金预购, 得到 50 优惠券');
    } else {
      orderNormal(orderType, pay, stock); // 将请求传递给普通订单
    }
  };
  const order500: OrderFn = (orderType, pay, stock) => {
    if (orderType === 1 && pay === true) {
      console.log('500 元定金预购, 得到 100 优惠券');
    } else {
      order200(orderType, pay, stock); // 将请求传递给 200 元订单
    }
  };
  order500(1, true, 500); // 输出：500 元定金预购, 得到 100 优惠券
  order500(1, false, 500); // 输出：普通购买, 无优惠券
  order500(2, true, 500); // 输出：200 元定金预购, 得到 500 优惠券
  order500(3, false, 500); // 输出：普通购买, 无优惠券
  order500(3, false, 0); // 输出：手机库存不足
}
// simulate2();
type ChainParam = (...rest: any[]) => 'nextSuccessor' | (string & {}) | void;
class Chain {
  successor: Chain;
  fn: ChainParam;
  constructor(fn: ChainParam) {
    this.fn = fn;
  }
  setNextSuccessor(successor: Chain) {
    return this.successor = successor;
  }
  passRequest(...rest: any[]) {
    const res = this.fn.apply(this, ...rest);
    if (res === 'nextSuccessor') {
      return this.successor && this.successor.passRequest.apply(this.successor, ...rest);
    }
    return res;
  }
  next(...rest: any[]) {
    return this.successor && this.successor.passRequest(...rest);
  }
}
const orderNormal: OrderFn = (orderType, pay, stock) => {
  if (stock > 0) {
    console.log('普通购买, 无优惠券');
    return;
  }
  console.log('手机库存不足');
};
const order200: OrderFn = (orderType, pay, stock) => {
  if (orderType === 2 && pay === true) {
    console.log('200 元定金预购, 得到 50 优惠券');
    return;
  }
  return 'nextSuccessor';
};
const order500: OrderFn = (orderType, pay, stock) => {
  if (orderType === 1 && pay === true) {
    console.log('500 元定金预购, 得到 100 优惠券');
    return;
  }
  return 'nextSuccessor';
};
function simulate3() {
  const chainOrder500 = new Chain(order500);
  const chainOrder200 = new Chain(order200);
  const chainOrderNormal = new Chain(orderNormal);

  chainOrder500.setNextSuccessor(chainOrder200);
  chainOrder200.setNextSuccessor(chainOrderNormal);

  chainOrder500.passRequest(1, true, 500); // 输出：500 元定金预购，得到 100 优惠券
  chainOrder500.passRequest(2, true, 500); // 输出：200 元定金预购，得到 50 优惠券
  chainOrder500.passRequest(3, true, 500); // 输出：普通购买，无优惠券
  chainOrder500.passRequest(1, false, 0); // 输出：手机库存不足
}
// simulate3();

/* 异步职责链 */
function simulate4() {
  const fn1 = new Chain(() => {
    console.log(1);
    return 'nextSuccessor';
  });
  const fn2 = new Chain(function () {
    console.log(2);
    setTimeout(() => {
      this.next();
    }, 2000);
  });
  const fn3 = new Chain(() => {
    console.log(3);
  });
  fn1.setNextSuccessor(fn2).setNextSuccessor(fn3);
  fn1.passRequest();
}
// simulate4();

/* 用 AOP 实现职责链 */
function simulate5() {
  Function.prototype.after = function (fn) {
    const self = this;
    return function () {
      const res = self.apply(this, arguments);
      if (res === 'nextSuccessor') {
        return fn.apply(this, arguments);
      }
      return res;
    };
  };
  const order = order500.after(order200).after(orderNormal);
  order(1, true, 500); // 输出：500 元定金预购，得到 100 优惠券
  order(2, true, 500); // 输出：200 元定金预购，得到 50 优惠券
  order(1, false, 500); // 输出：普通购买，无优惠券
}
simulate5();
