import { Application } from "express";
import fs from "node:fs";
import path from "node:path";
import authRouter from "./auth/authRouter";
import homeRouter from "./home/homeRouter";
export { authRouter, homeRouter };

export function mountRouters(app: Application) {
  const dir = __dirname;

  const files = fs.readdirSync(dir);
  let routeCounter = 0;

  for (const file of files) {
    const fPath = path.join(dir, file);
    const stat = fs.statSync(fPath);

    if (stat.isFile()) {
      // console.log("File: ", fPath);
    } else if (stat.isDirectory()) {
      const subFiles = fs.readdirSync(fPath);

      for (const subFile of subFiles) {
        const subFilePath = path.join(fPath, subFile);
        if (fs.statSync(subFilePath).isFile()) {
          const routePath = subFile.split(".")[0];

          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const routeModule = require(subFilePath);
          const router = routeModule.default || routeModule;

          let routeName = routePath.split(/Router/)[0];
          routeName = routeName.replace(/([A-Z])/g, "-$1").toLowerCase();

          if (routeName === "home") {
            app.use(`/`, router);
          } else {
            app.use(`/${routeName}`, router);
          }
          console.log(`Mounting router at /${routeName} from ${routePath}`);
          routeCounter++;
        }
      }
    }
  }

  console.log(`A total of ${routeCounter} was mounted`);
}
