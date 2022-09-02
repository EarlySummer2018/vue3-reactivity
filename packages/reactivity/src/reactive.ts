import { isObject } from "@vue/shared";
import {
  mutableHandler,
  readonlyHandler,
  shallowMutableHandler,
  shallowReadonlyHandler,
} from "./baseHandler";

const reactive = (target: object) => {
  return createReactiveObject(target, false, mutableHandler);
};

const shallowReactive = (target: object) => {
  return createReactiveObject(target, false, shallowMutableHandler);
};

const readonly = (target: object) => {
  return createReactiveObject(target, true, readonlyHandler);
};

const shallowReadonly = (target: object) => {
  return createReactiveObject(target, true, shallowReadonlyHandler);
};

/**
 * weakMap 和 Map 的区别:
 * 1、Map 具有强引用，当我们将引用类型的 key 赋值为 null 时，它不会被垃圾回收，而是继续使用，所以会造成内存泄漏，
 * 而 weakMap 具有弱引用，当我们将引用类型的 key 赋值为 null 时, 会直接被垃圾回收。
 * 2、map 的 key 可以是任意类型的，而 weakMap 只能是 引用类型，不然会报错。
 * 3、由于 weakMap 具有弱引用，所以它没有 map 的 size，keys，values等 API。
 */

// 响应式 map
const reactiveMap = new WeakMap();
// 只读响应式 map
const readonlyMap = new WeakMap();
// 创建响应式对象
/**
 *
 * @param target 代理目标
 * @param isReadonly 是否是只读的
 * @param baseHandler 针对不同的方式创建不同的代理对象
 */
const createReactiveObject = (
  target: object,
  isReadonly: boolean,
  baseHandler: any
) => {
  // 判断是否是对象，如果是，则执行下面语句，否则直接返回当前 target
  if (!isObject(target)) return target;

  // 从集合中获取当前对象
  const existProxy = isReadonly
    ? readonlyMap.get(target)
    : reactiveMap.get(target);
  // 判断当前属性是否代理过，如果是，则直接返回，否则就创建代理
  if (existProxy) return existProxy;

  // 创建代理
  const proxy = new Proxy(target, baseHandler);

  // 代理成功之后将当前代理存入 map 中
  reactiveMap.set(target, proxy);
  return proxy;
};

export { reactive, shallowReactive, readonly, shallowReadonly };
