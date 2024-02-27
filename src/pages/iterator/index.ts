/* 迭代器模式 */
/* 迭代器模式提供一种方法顺序访问一个聚合对象中的各个元素，而又不暴露该对象的内部表示 */

const arr = [1, 2, 3];


function forof<T>(iteratorTarget: Iterable<T>, callback: (param: T) => void) {
  const iterator = iteratorTarget[Symbol.iterator]();
  let res: IteratorResult<T, any> = { done: false, value: undefined };
  while (!res.done) {
    res = iterator.next();
    if (res.done) {
      console.log('done!');
    } else {
      console.log('res :>>', res);
      callback.call(iteratorTarget, res.value);
    }
  }
}

forof(arr, (item) => {
  console.log('item :>>', item);
});

function* iteratorGenerator() {
  yield 'Mark 1';
  yield 'Mark 2';
  yield 'Mark 3';
}

// const iterator = iteratorGenerator();
// console.log('iterator2.next() :>>', iterator2.next());
// console.log('iterator2.next() :>>', iterator2.next());
// console.log('iterator2.next() :>>', iterator2.next());
// console.log('iterator2.next() :>>', iterator2.next());

// 迭代器生成函数
function arrayLikeGenerator<T>(list: T[]): IterableIterator<T> {
  let idx = 0;
  let len = list.length;
  return {
    next() {
      const done = idx >= len;
      const value = !done ? list[idx++] : undefined;
      return { done, value };
    },
  } as IterableIterator<T>;
}
// const iterator2 = arrayLikeGenerator(['Mark 1', 'Mark 2', 'Mark 3']);
// console.log('iterator2.next() :>>', iterator2.next());
// console.log('iterator2.next() :>>', iterator2.next());
// console.log('iterator2.next() :>>', iterator2.next());
// console.log('iterator2.next() :>>', iterator2.next());

// 倒序迭代器
function reverseEach<T>(list: T[], callback: (param: T, thisArg: typeof list) => void) {
  for (let i = list.length - 1; i >= 0; i -= 1) {
    callback.call(list, list[i], list);
  }
}
reverseEach([1, 2, 3, 4, 5], (item) => {
  console.log('item :>>', item);
});