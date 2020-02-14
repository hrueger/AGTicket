import { validate } from "class-validator";
import { Request, Response } from "express";
import * as i18n from "i18n";
import { getRepository } from "typeorm";
import { isArray } from "util";
import { Ticket } from "../entity/Ticket";
import * as QRCode from "qrcode";
import * as PDFKit from "pdfkit";

class TicketController {
  public static listAll = async (req: Request, res: Response) => {
    const ticketRepository = getRepository(Ticket);
    const tickets = await ticketRepository.find();
    res.send(tickets);
  }

  public static printAll = async (req: Request, res: Response) => {
    const ticketRepository = getRepository(Ticket);
    const tickets = await ticketRepository.find();
    printTickets(tickets, res);
  }

  public static activateTicket = async (req: Request, res: Response) => {
    const ticketRepository = getRepository(Ticket);
    try {
      const ticket = await ticketRepository.findOne({where: {guid: req.params.guid}});
      ticket.activated = true;
      ticketRepository.save(ticket);
    } catch (err) {
      res.status(500).send({message: err});
      return;
    }
    res.send({status: true});
  }

  public static printSome = async (req: Request, res: Response) => {
    const guids = req.body.tickets;
    const ticketRepository = getRepository(Ticket);
    let tickets = await ticketRepository.find();
    tickets = tickets.filter((t) => guids.includes(t.guid));
    printTickets(tickets, res);
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
        activated: false,
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

async function printTickets(tickets: Ticket[], res) {
  const margin = 15;
  const contentMargin = 10;
  const ticketsX = 2;
  const ticketsY = 6;
  const title = "Frühjahrsgala 2021";
  const location = "Allgäu-Gymnasium Kempten";
  const date = "70.13.2021";

  const fullheight = 793;
  const fullwidth = 611;
  const qrSize = 70;
  const pageHeight = fullheight - (2 * margin);
  const pageWidth = fullwidth - (2 * margin);
  const ticketWidth = (pageWidth - ((ticketsX - 1) * margin)) / ticketsX;
  const ticketHeight = (pageHeight - ((ticketsY - 1) * margin)) / ticketsY;

  const document = new PDFKit({margin, info: {Author: "AGTicket", CreationDate: new Date(), Creator: "AGTicket", Title: "Tickets"}});
  document.pipe(res);
  let x = 0;
  let y = 0;
  for (const ticket of tickets) {
    const ticketStartX = (margin * (x + 1)) + (ticketWidth * x);
    const ticketStartY = (margin * (y + 1)) + (ticketHeight * y);
    const ticketContentStartX = ticketStartX + contentMargin;
    const ticketContentStartY = ticketStartY + contentMargin;
    document.fillColor("black");
    document.rect(ticketStartX, ticketStartY, ticketWidth, ticketHeight).stroke();
    document.fontSize(20);
    document.text(title, ticketContentStartX, ticketContentStartY);
    document.fontSize(10);
    document.text(ticket.name, ticketContentStartX, ticketContentStartY + 30);
    document.text(location, ticketContentStartX, ticketContentStartY + 50);
    document.text(date, ticketContentStartX, ticketContentStartY + 65);
    document.fontSize(7);
    document.fillColor("grey");
    document.text(`Ticket #${ticket.guid}`, ticketContentStartX, ticketContentStartY + 90);
    document.image(
      await QRCode.toDataURL(ticket.guid, {margin: 1, width: qrSize}),
      ticketContentStartX + ticketWidth - (contentMargin * 2) - qrSize,
      ticketContentStartY + ticketHeight - (contentMargin * 2) - qrSize,
    );
    x++;
    if (x >= ticketsX) {
      x = 0;
      y++;
    }
    if (y >= ticketsY) {
      y = 0;
      document.addPage();
    }
  }
  document.end();
}