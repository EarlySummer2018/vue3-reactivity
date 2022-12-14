var VueReactivity = (function (exports) {
  'use strict';

  // 判断是不是对象
  const isObject = (data) => typeof data === "object" && data !== null;
  // 判断是否改变
  const hasChanged = (oldValue, newValue) => !Object.is(oldValue, newValue);
  // 判断是否是数组
  const isArray = Array.isArray;
  // 对象合并
  const assign = Object.assign;
  // 判断是不是整数字符串
  const isIntegerKey = (key) => parseInt(key) + "" === key;
  // 判断是不是对象本身的属性
  const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);

  function effect(fn, options = {}) {
      const effect = createReactiveEffect(fn, options);
      if (!options.lazy) {
          effect();
      }
      return effect;
  }
  const effectStack = [];
  let activeEffect;
  function createReactiveEffect(fn, options) {
      //   debugger;
      const effect = function reactiveEffect() {
          try {
              effectStack.push(effect);
              activeEffect = effect;
              return fn();
          }
          finally {
              effectStack.pop();
              activeEffect = effectStack[effectStack.length - 1];
          }
      };
      effect._isEffect = true;
      effect.options = options;
      effect.deps = [];
      return effect;
  }
  const targetMap = new WeakMap();
  const track = (target, type, key) => {
      if (activeEffect === undefined) {
          return;
      }
      let depsMap = targetMap.get(target);
      if (!depsMap) {
          targetMap.set(target, (depsMap = new Map()));
      }
      let dep = depsMap.get(key);
      if (!dep) {
          depsMap.set(key, (dep = new Set()));
      }
      if (!dep.has(activeEffect)) {
          dep.add(activeEffect);
      }
  };
  const trigger = (target, type, key, newVal, oldVal) => {
      const depsMap = targetMap.get(target);
      if (!depsMap) {
          return;
      }
      const effectSet = new Set();
      const add = (effects) => {
          if (effects) {
              effects.forEach((effect) => {
                  effectSet.add(effect);
              });
          }
      };
      if (key === "length" && isArray(target)) {
          depsMap.forEach((dep, key) => {
              console.log("depKey", dep, key);
              if (key > newVal || key === "length") {
                  add(dep);
              }
          });
      }
      else {
          add(depsMap.get(key));
          switch (type) {
              case "add":
                  if (isArray(target) && isIntegerKey(key)) {
                      add(depsMap.get("length"));
                  }
          }
      }
      effectSet.forEach((effect) => effect());
  };

  /**
   *
   * @param isReadonly 是不是仅读的
   * @param isShallow 是不是浅的
   */
  // 创建 getter
  const createGetter = (isReadonly = false, isShallow = false) => {
      /**
       * target 源对象
       * key 建
       * receiver 代理对象
       */
      return function get(target, key, receiver) {
          const res = Reflect.get(target, key, receiver);
          if (isShallow)
              return res;
          // 如果不是只读就进行依赖收集
          if (!isReadonly) {
              // console.log("收集依赖");
              track(target, "get", key);
          }
          if (isObject(res))
              return isReadonly ? readonly(res) : reactive(res);
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
  const createSetter = (isReadonly = false, isShallow = false) => {
      /**
       * target 源对象
       * key 建
       * value 新值
       * receiver 代理的对象
       */
      // 针对数组而言，如果调用 push 方法，就会触发两次 set，一次为数组新增了一项，一次改变数组的长度，
      // 但是再为数组新增一项的时候就同时修改了数组的长度了，所以第二次调用是没有意义的
      return function set(target, key, value, receiver) {
          const oldVal = target[key];
          const hadKey = isArray(target) && isIntegerKey(key)
              ? Number(key) < target.length
              : hasOwn(target, key);
          const res = Reflect.set(target, key, value, receiver);
          if (!hadKey) {
              console.log("新增");
              trigger(target, "add", key, value);
          }
          else if (hasChanged(oldVal, value)) {
              console.log("修改");
              trigger(target, "set", key, value);
          }
          // console.log("设置值", target, key, value);
          return res;
      };
  };
  // 既不是仅读的也不是浅的 set
  const set = createSetter();
  // 不是仅读的但是是浅的 set
  const shallowSet = createSetter(false, true);
  const mutableHandler = {
      get,
      set,
  };
  const shallowMutableHandler = {
      get: shallowGet,
      set: shallowSet,
  };
  const readonlySet = {
      set(target, key) {
          console.warn(`warning: Cannot set key '${key}' , source target is readonly`);
      },
  };
  const readonlyHandler = assign({ get: readonlyGet }, readonlySet);
  const shallowReadonlyHandler = assign({ get: shallowReadonlyGet }, readonlySet);

  function reactive(target) {
      return createReactiveObject(target, false, mutableHandler);
  }
  function shallowReactive(target) {
      return createReactiveObject(target, false, shallowMutableHandler);
  }
  function readonly(target) {
      return createReactiveObject(target, true, readonlyHandler);
  }
  function shallowReadonly(target) {
      return createReactiveObject(target, true, shallowReadonlyHandler);
  }
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
  const createReactiveObject = (target, isReadonly, baseHandler) => {
      // 判断是否是对象，如果是，则执行下面语句，否则直接返回当前 target
      if (!isObject(target))
          return target;
      // 从集合中获取当前对象
      const existProxy = isReadonly
          ? readonlyMap.get(target)
          : reactiveMap.get(target);
      // 判断当前属性是否代理过，如果是，则直接返回，否则就创建代理
      if (existProxy)
          return existProxy;
      // 创建代理
      const proxy = new Proxy(target, baseHandler);
      // 代理成功之后将当前代理存入 map 中
      reactiveMap.set(target, proxy);
      return proxy;
  };

  exports.effect = effect;
  exports.reactive = reactive;
  exports.readonly = readonly;
  exports.shallowReactive = shallowReactive;
  exports.shallowReadonly = shallowReadonly;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=reactivity.esm-bundler.js.map
