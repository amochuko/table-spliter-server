import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import envs from "./common/utils/env";
import { requestTime } from "./middleware";
import { mountRouters } from "./routers";

class App {
  public app: Application;

  constructor() {
    console.log("🚀 Initializing Express app...");
    this.app = express();

    this.initMiddleware();
    this.initRoutes();

    console.log("Routes mounted:", this.app._router.stack.length ?? 0);
  }

  private initMiddleware() {
    this.app.disable("x-powered-by");

    // middleware
    this.app.use(cookieParser(envs.COOKIE_SECRET));
    this.app.use(helmet()); // maintain default helmet config
    this.app.use(cors());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json({ limit: "10mb" }));

    if (this.app.get("env") === "test") {
      this.app.use(morgan("dev"));
    }

    this.app.use(
      compression({
        filter: (req, res) => {
          if (req.headers["x-no-compression"]) {
            return false;
          }
          return compression.filter(req, res);
        },
      })
    );

    this.app.use(requestTime);
  }

  private initDB() {}

  private initRoutes() {
    this.app.get("/health", (req, res) => {
      res.json({ data: "Server up and running!" });
    });

    // Mount all routers first
    mountRouters(this.app);

    this.app.use(
      (
        // eslint-disable-next-line no-undef
        err: NodeJS.ErrnoException,
        req: Request,
        res: Response,
        // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
        _next: NextFunction
      ) => {
        // Error handling
        console.error(err.stack || err);
        res.status(500).send({ error: "Something broke" });
      }
    );
    process.on("uncaughtException", (err) => {
      console.error(`${err.name} ${err.message}`);
    });

    // Then mount the 404 handler
    console.log("Mounting 404 fallback...");
    this.app.use((req, res) => {
      console.log("Hit global 404 handler for:", req.path);
      // 404 response should remain at the very bottom of the stack
      res.status(404).json({ error: "Sorry can't find that!" });
    });
  }
}

export default new App().app;
