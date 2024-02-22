/* 深拷贝 */
// string number boolean null undefined bigint symbol
// Array Object Date Map Set

function deepCopy(obj, map = new Map()) {
  if (typeof obj === 'symbol') {
    return Symbol(obj.description);
  }

  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (map.has(obj)) {
    return map.get(obj);
  }

  let copyObj = {};

  if (Array.isArray(obj)) {
    const Ctor = obj.constructor;
    copyObj = new Ctor();
  }

  map.set(obj, copyObj);

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      copyObj[key] = deepCopy(obj[key], map);
    }
  }
  return copyObj;
}

const obj = {
  a: 1,
  b: 'string',
  c: true,
  d: null,
  e: undefined,
  f: {
    fa: 1,
    fb: 'string',
    fc: true
  },
  g: [1, 'string', false],
  h: Symbol(1),
  i: 1111111111111111111111111111111111111n,
};
obj.j = obj;
const obj2 = deepCopy(obj);
console.log(obj2, obj === obj2, obj.j === obj2.j);