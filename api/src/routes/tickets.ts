import { Router } from "express";
import TicketController from "../controllers/TicketController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], TicketController.listAll);
router.post("/", [checkJwt], TicketController.newTickets);
// router.post("/:id([0-9]+)", [checkJwt], TicketController.seenTicket);
// router.delete("/:id([0-9]+)", [checkJwt], TicketController.deleteTicket);

export default router;
