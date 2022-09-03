// 判断是不是对象
export const isObject = (data: any) =>
  typeof data === "object" && data !== null;

// 判断是否改变
export const hasChanged = (oldValue: any, newValue: any) =>
  !Object.is(oldValue, newValue);

// 判断是否是数组
export const isArray = Array.isArray;

// 对象合并
export const assign = Object.assign;

// 判断是不是整数字符串
export const isIntegerKey = (key: any) => parseInt(key) + "" === key;

// 判断是不是对象本身的属性
export const hasOwn = (target: any, key: any) =>
  Object.prototype.hasOwnProperty.call(target, key);
