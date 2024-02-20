/* 原型模式 */
const Plane = function () {
  this.blood = 100;
  this.attackLevel = 1;
  this.defenseLevel = 1;
};
const plane = new Plane();
plane.blood = 500;
plane.attackLevel = 10;
plane.defenseLevel = 7;
const clonePlane = Object.create(plane);
console.log(clonePlane); // Object { blood: 500, attackLevel: 10, defenseLevel: 7 }

Object.create = Object.create || function (obj) {
  const F = function () { };
  F.prototype = obj;
  return new F();
};

function Person(name) {
  this.name = name;
}

Person.prototype.getName = function () {
  return this.name;
};

const objectFactory = function () {
  const obj = Object.create(Object.prototype);
  const Ctor = [].shift.call(arguments);
  Object.setPrototypeOf(obj, Ctor.prototype);
  const res = Ctor.apply(obj, arguments);
  return typeof res === 'object' ? res : obj;
};

console.log(objectFactory(Person, 'xyz'));