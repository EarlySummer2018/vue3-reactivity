// 这里针对 monorepo 进行编译项目
// node 解析 packages 目录
import fs from "fs";
import { execa } from "execa";
// 读取目录中需要打包的文件夹
const dirs = fs.readdirSync("packages").filter((el) => {
  if (!fs.statSync(`packages/${el}`).isDirectory()) {
    return false;
  }
  return true;
});

// 并行打包
const build = async (target) => {
  //{stdio: 'inherit'} 子进程的输出需要在父进程中打印
  await execa("rollup", ["-c", "--environment", `TARGET:${target}`], {
    stdio: "inherit",
  });
};

const runParallel = (dirs, iterfn) => {
  let result = [];
  for (const item of dirs) {
    result.push(iterfn(item));
  }
  return Promise.all(result);
};

runParallel(dirs, build)
  .then(() => {
    console.log("打包成功");
  })
  .catch((err) => {
    console.log("打包失败：", err);
  });
