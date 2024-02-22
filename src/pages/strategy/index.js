/* 策略模式 */
// 定义一系列的算法，把它们一个个封装起来，并且使它们可以相互替换。

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
  return priceProcessor[tag](originPrice);
}


askPrice('backPrice', 100)

/* 使用策略模式实现缓动动画 */

