import { Router } from "express";
import TicketController from "../controllers/TicketController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], TicketController.listAll);
router.get("/print", [checkJwt], TicketController.printAll);
router.post("/print", [checkJwt], TicketController.printSome);
router.post("/", [checkJwt], TicketController.newTickets);
router.post("/:guid/activate", [checkJwt], TicketController.activateTicket);
router.post("/delete", [checkJwt], TicketController.deleteTickets);
// router.delete("/:id([0-9]+)", [checkJwt], TicketController.deleteTicket);

export default router;
