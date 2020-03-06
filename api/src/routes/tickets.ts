import { Router } from "express";
import TicketController from "../controllers/TicketController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", [checkJwt], TicketController.listAll);
router.post("/", [checkJwt], TicketController.newTickets);
router.post("/:guid", [checkJwt], TicketController.editTicket);
router.post("/:guid/activate", [checkJwt], TicketController.activateTicket);
router.post("/delete", [checkJwt], TicketController.deleteTickets);

export default router;
