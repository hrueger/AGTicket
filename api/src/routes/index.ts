import { Router } from "express";
import auth from "./auth";
import tickets from "./tickets";
import user from "./user";
import config from "./config";

const routes = Router();

routes.use("/auth", auth);
routes.use("/tickets", tickets);
routes.use("/config", config);
routes.use("/users", user);

export default routes;
