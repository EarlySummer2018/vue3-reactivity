import {
  assign,
  hasChanged,
  hasOwn,
  isArray,
  isIntegerKey,
  isObject,
} from "@vue/shared";
import { reactive, readonly } from "./reactive";

/**
 *
 * @param isReadonly 是不是仅读的
 * @param isShallow 是不是浅的
 */
// 创建 getter
const createGetter = (
  isReadonly: boolean = false,
  isShallow: boolean = false
) => {
  /**
   * target 源对象
   * key 建
   * receiver 代理对象
   */
  return function get(target: object, key: string, receiver: object) {
    const res = Reflect.get(target, key, receiver);
    if (isShallow) return res;
    // 如果不是只读就进行依赖收集
    if (!isReadonly) {
      // console.log("收集依赖");
    }
    if (isObject(res)) return isReadonly ? readonly(res) : reactive(res);
    return res;
  };
};

// 既不是仅读的也不是浅的 get
const get = createGetter();
// 不是仅读的但是是浅的 get
const shallowGet = createGetter(false, true);
// 是仅读的但不是浅的 get
const readonlyGet = createGetter(true);
// 即是仅读的也是浅的 get
const shallowReadonlyGet = createGetter(true, true);

/**
 *
 * @param isReadonly 是不是仅读的
 * @param isShallow 是不是浅的
 */
// 创建 setter
const createSetter = (
  isReadonly: boolean = false,
  isShallow: boolean = false
) => {
  /**
   * target 源对象
   * key 建
   * value 新值
   * receiver 代理的对象
   */
  // 针对数组而言，如果调用 push 方法，就会触发两次 set，一次为数组新增了一项，一次改变数组的长度，
  // 但是再为数组新增一项的时候就同时修改了数组的长度了，所以第二次调用是没有意义的
  return function set(
    target: object,
    key: string,
    value: any,
    receiver: object
  ) {
    const oldVal = (target as any)[key];
    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);
    const res = Reflect.set(target, key, value, receiver);
    if (!hadKey) {
      console.log("新增");
    } else if (hasChanged(oldVal, value)) {
      console.log("修改");
    }
    // console.log("设置值", target, key, value);
    return res;
  };
};

// 既不是仅读的也不是浅的 set
const set = createSetter();
// 不是仅读的但是是浅的 set
const shallowSet = createSetter(false, true);

export const mutableHandler = {
  get,
  set,
};
export const shallowMutableHandler = {
  get: shallowGet,
  set: shallowSet,
};
const readonlySet = {
  set(target: object, key: string) {
    console.warn(
      `warning: Cannot set key '${key}' , source target is readonly`
    );
  },
};
export const readonlyHandler = assign({ get: readonlyGet }, readonlySet);
export const shallowReadonlyHandler = assign(
  { get: shallowReadonlyGet },
  readonlySet
);
