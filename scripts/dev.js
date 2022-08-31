// 这里针对 monorepo 进行编译项目
import { execa } from "execa";

// 并行打包
const build = async (target) => {
  //{stdio: 'inherit'} 子进程的输出需要在父进程中打印
  await execa("rollup", ["-cw", "--environment", `TARGET:${target}`], {
    stdio: "inherit",
  });
};

build("reactivity");
