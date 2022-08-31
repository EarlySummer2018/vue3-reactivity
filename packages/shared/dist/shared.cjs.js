var shared = (function (exports) {
    'use strict';

    // 判断是不是对象
    const isObject = (data) => {
        return typeof data === 'object' && data !== null;
    };
    // 对象合并
    const assign = Object.assign;

    exports.assign = assign;
    exports.isObject = isObject;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({});
//# sourceMappingURL=shared.cjs.js.map
