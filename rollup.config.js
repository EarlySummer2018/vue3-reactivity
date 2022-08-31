import ts from "rollup-plugin-typescript2"; // 解析 ts 插件
import resolvePlugin from "@rollup/plugin-node-resolve"; // 解析第三方模块
import path from "path"; //处理路径

// 获取 package 目录
let packagesDir = path.resolve(__dirname, "packages"); // 获取 packages 的绝对路径
let packageDir = path.resolve(packagesDir, process.env.TARGET); // 获取对应要打包的路径

// 获取这个路径下的 package.json
// 根据当前需要打包的路径来解析
const resolve = (el) => path.resolve(packageDir, el);
const pkg = require(resolve("package.json"));

const packageOptions = pkg.buildOptions;
const name = path.basename(packageDir);

const outputConfig = {
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: "es",
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: "cjs",
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: "global",
  },
};

const createConfig = (format, output) => {
  // 用于 iife 在 window 上挂载的属性
  output.name = packageOptions.name;
  output.format = "iife";
  output.sourcemap = true; // 稍后生成 sorcemap
  return {
    //   打包入口文件
    input: resolve("src/index.ts"),
    output,
    plugins: [
      ts({
        // ts 编译的时候用的文件是哪一个
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
      }),
      resolvePlugin(),
    ],
  };
};

// 根据用户提供的 formats 选项 去配置里面取值进行生产配置文件
export default packageOptions.formats.map((format) =>
  createConfig(format, outputConfig[format])
);
