import { isArray, isIntegerKey } from "@vue/shared";

export function effect<T = any>(fn: () => T, options: any = {}) {
  const effect = createReactiveEffect(fn, options);
  if (!options.lazy) {
    effect();
  }

  return effect;
}
const effectStack: any[] = [];
let activeEffect: any;
function createReactiveEffect<T = any>(fn: () => T, options?: any) {
  //   debugger;
  const effect: any = function reactiveEffect() {
    try {
      effectStack.push(effect);
      activeEffect = effect;
      return fn();
    } finally {
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
export const track = (target: any, type: string, key: any) => {
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

export const trigger = (
  target: any,
  type: string,
  key: any,
  newVal: any,
  oldVal?: any
) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }

  const effectSet = new Set();
  const add = (effects: any) => {
    if (effects) {
      effects.forEach((effect: any) => {
        effectSet.add(effect);
      });
    }
  };

  if (key === "length" && isArray(target)) {
    depsMap.forEach((dep: any, key: any) => {
      console.log("depKey", dep, key);
      if (key > newVal || key === "length") {
        add(dep);
      }
    });
  } else {
    add(depsMap.get(key));
    switch (type) {
      case "add":
        if (isArray(target) && isIntegerKey(key)) {
          add(depsMap.get("length"));
        }
    }
  }

  effectSet.forEach((effect: any) => effect());
};
