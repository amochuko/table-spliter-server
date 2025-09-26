import { Application } from "express";
import fs from "node:fs";
import path from "node:path";
import authRouter from "./auth/authRouter";
import homeRouter from "./home/homeRouter";
export { authRouter, homeRouter };

export function mountRouters(app: Application) {
  const dir = __dirname;

  fs.readdir(dir, (err, files) => {
    if (err) {
      throw err;
    }

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
    
            app.use(`/${routeName}`, router);
            console.log(`${routeName} was mounted`);
            routeCounter++;
          }
        }
      }
    }

    console.log(`A total of ${routeCounter} was mounted`);
  });
}
