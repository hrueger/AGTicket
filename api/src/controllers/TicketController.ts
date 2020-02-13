import { validate } from "class-validator";
import { Request, Response } from "express";
import * as i18n from "i18n";
import { getRepository } from "typeorm";
import { isArray } from "util";
import { Ticket } from "../entity/Ticket";
import { User } from "../entity/User";

class TicketController {
  public static listAll = async (req: Request, res: Response) => {
    const ticketRepository = getRepository(Ticket);
    const tickets = await ticketRepository.find();
    res.send(tickets);
  }

  public static newTickets = async (req: Request, res: Response) => {
    const ticketRepository = getRepository(Ticket);
    let { tickets } = req.body;
    if (!(tickets && isArray(tickets) && tickets.length > 0)) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
      return;
    }
    tickets = tickets.map((t) => {
      return {
        active: true,
        guid: t.guid,
        name: t.name,
      };
    });

    try {
      await ticketRepository.save(tickets);
    } catch (e) {
      res.status(500).send({message: `${i18n.__("errors.error")} ${e.toString()}`});
      return;
    }

    res.status(200).send({status: true});
  }

  public static seenTicket = async (req: Request, res: Response) => {
    const id = req.params.id;
    return;
    const ticketRepository = getRepository(Ticket);
    let ticket: Ticket;
    try {
      ticket = await ticketRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send({message: i18n.__("errors.ticketNotFound")});
      return;
    }
    ticketRepository.delete(id);

    res.status(200).send({status: true});
  }

  public static deleteTicket = async (req: Request, res: Response) => {
    const id = req.params.id;

    const ticketRepository = getRepository(Ticket);
    let ticket: Ticket;
    try {
      ticket = await ticketRepository.findOneOrFail(id);
    } catch (error) {
      res.status(404).send({message: i18n.__("errors.ticketNotFound")});
      return;
    }
    ticketRepository.delete(id);

    res.status(200).send({status: true});
  }
}

export default TicketController;
