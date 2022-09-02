import { assign, isObject } from "@vue/shared";
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
  return function getter(target: object, key: string, receiver: object) {
    const res = Reflect.get(target, key, receiver);
    if (isShallow) return res;
    // 如果不是只读就进行依赖收集
    if (!isReadonly) {
      console.log("收集依赖");
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
  return function setter(
    target: object,
    key: string,
    value: any,
    receiver: object
  ) {
    const res = Reflect.set(target, key, value, receiver);
    console.log("设置值");

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
