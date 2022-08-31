// 判断是不是对象
export const isObject = (data: any) => {
    return typeof data === 'object' && data !== null
}

// 对象合并
export const assign = Object.assign