import { validate } from "class-validator";
import { Request, Response } from "express";
import * as i18n from "i18n";
import { getRepository } from "typeorm";
import { isArray } from "util";
import { Ticket } from "../entity/Ticket";
import * as QRCode from "qrcode";
import * as bwip from "bwip-js";
import * as PDFKit from "pdfkit";
import { getConfig } from "../utils/utils";

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
      if (ticket.activated == true) {
        res.send({status: "Das Ticket ist schon aktiviert!"});
        return;
      }
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

  public static deleteTickets = async (req: Request, res: Response) => {
    const ids = req.body.tickets;
    if (!isArray(ids)) {
      res.status(400).send({message: i18n.__("errors.notAllFieldsProvided")});
      return;
    }
    const ticketRepository = getRepository(Ticket);
    const tickets = await ticketRepository.find();
    try {
      for (const ticket of tickets) {
        if (ids.includes(ticket.guid)) {
          await ticketRepository.remove(ticket);
        }
      }
    } catch (error) {
      res.status(404).send({message: i18n.__("errors.ticketNotFound")});
      return;
    }
    res.status(200).send({status: true});
  }
}

export default TicketController;

async function printTickets(tickets: Ticket[], res) {

  const config = await getConfig();

  const ticketSpacing = parseInt(config.ticketSpacing, undefined);
  const contentSpacing = parseInt(config.contentSpacing, undefined);
  const ticketsX = parseInt(config.ticketsX, undefined);
  const ticketsY = parseInt(config.ticketsY, undefined);
  const title = config.title;
  const location = config.location;
  const date = config.date;

  const fullheight = 793;
  const fullwidth = 611;
  const qrSize = 70;
  const barcodeSize = 30;
  const pageHeight = fullheight - (2 * ticketSpacing);
  const pageWidth = fullwidth - (2 * ticketSpacing);
  const ticketWidth = (pageWidth - ((ticketsX - 1) * ticketSpacing)) / ticketsX;
  const ticketHeight = (pageHeight - ((ticketsY - 1) * ticketSpacing)) / ticketsY;

  const document = new PDFKit({margin: ticketSpacing, info: {Author: "AGTicket", CreationDate: new Date(), Creator: "AGTicket", Title: "Tickets"}});
  document.pipe(res);
  let x = 0;
  let y = 0;
  for (const ticket of tickets) {
    const ticketStartX = (ticketSpacing * (x + 1)) + (ticketWidth * x);
    const ticketStartY = (ticketSpacing * (y + 1)) + (ticketHeight * y);
    const ticketContentStartX = ticketStartX + contentSpacing;
    const ticketContentStartY = ticketStartY + contentSpacing;
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
    if (config.codeType == "qr" || config.idType == "guid") {
      document.image(
        await QRCode.toDataURL(ticket.guid, {margin: 1, width: qrSize}),
        ticketContentStartX + ticketWidth - (contentSpacing * 2) - qrSize,
        ticketContentStartY + ticketHeight - (contentSpacing * 2) - qrSize,
      );
    } else {
      document.image(
        await new Promise((resolve, reject) => {
          bwip.toBuffer({text: ticket.guid, rotate: "L", bcid: "code128"}, (err, png) => {
            if (err) {
              reject(err);
            } else {
              resolve(`data:image/png;base64, ${png.toString("base64")}`);
            }
          });
        }),
        ticketContentStartX + ticketWidth - (contentSpacing * 2) - barcodeSize,
        ticketContentStartY,
        {
          width: barcodeSize,
          height: ticketHeight - (contentSpacing * 2),
        },
      );
    }
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