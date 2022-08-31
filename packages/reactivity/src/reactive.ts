import { isObject } from '../../shared/src/index'
// 响应式 map
const reactiveMap = new WeakMap()
// 只读响应式 map
const readonlyMap = new WeakMap()
// 创建响应式对象
const createReactiveObject = (target: object, isReadonly: boolean, baseHandler: any) => {

    // 判断是否是对象，如果是，则执行下面语句，否则直接返回当前 target
    if (!isObject(target)) return target

    // 从集合中获取当前对象
    const existProxy = isReadonly ? readonlyMap.get(target) : reactiveMap.get(target)
    // 判断当前属性是否代理过，如果是，则直接返回，否则就创建代理
    if (existProxy) return existProxy

    // 创建代理
    const proxy = new Proxy(target, baseHandler)

    // 代理成功之后将当前代理存入 map 中
    reactiveMap.set(target, proxy)
    return proxy
}