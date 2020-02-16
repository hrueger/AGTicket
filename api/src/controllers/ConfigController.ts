import { Request, Response } from "express";
import * as i18n from "i18n";
import { getRepository } from "typeorm";
import { Config } from "../entity/Config";

class ConfigController {
  public static listAll = async (req: Request, res: Response) => {
    const configRepository = getRepository(Config);
    const configs = await configRepository.find();
    res.send(configs);
  }

  public static save = async (req: Request, res: Response) => {
    const configRepository = getRepository(Config);
    const {title, location, date, ticketsX, ticketsY, codeType, idType, ticketSpacing, contentSpacing} = req.body;
    if (!(title && location && date && ticketsX && ticketsY && codeType && idType)) {
      res.status(400).send(i18n.__("errors.notAllFieldsProvided"));
      return;
    }
    if (
      parseInt(ticketsX, undefined) < 1 || parseInt(ticketsX, undefined) > 10 ||
      parseInt(ticketsY, undefined) < 1 || parseInt(ticketsY, undefined) > 20 ||
      parseInt(ticketSpacing, undefined) < 0 || parseInt(ticketSpacing, undefined) > 50 ||
      parseInt(contentSpacing, undefined) < 0 || parseInt(contentSpacing, undefined) > 50 ||
      !(["qr", "bar"].includes(codeType)) ||
      !(["guid", "numbers", "letters"].includes(idType)) ||
      title.trim() == "" ||
      location.trim() == "" ||
      date.trim() == ""
    ) {
      res.status(400).send(i18n.__("errors.notAllFieldsValid"));
      return;
    }
    const configs: Config[] = [];
    configs.push({key: "title", value: title});
    configs.push({key: "location", value: location});
    configs.push({key: "date", value: date});
    configs.push({key: "ticketsX", value: ticketsX});
    configs.push({key: "ticketsY", value: ticketsY});
    configs.push({key: "codeType", value: codeType});
    configs.push({key: "idType", value: idType});
    configs.push({key: "ticketSpacing", value: ticketSpacing});
    configs.push({key: "contentSpacing", value: contentSpacing});
    await configRepository.save(configs);
    res.send({status: true});
  }
}

export default ConfigController;
