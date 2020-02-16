import { Router } from "express";
import ConfigController from "../controllers/ConfigController";
import { checkJwt } from "../middlewares/checkJwt";
import { checkForAdmin } from "../middlewares/checkForAdmin";

const router = Router();

router.get("/", [checkJwt], ConfigController.listAll);
router.post("/", [checkJwt, checkForAdmin()], ConfigController.save);

export default router;
