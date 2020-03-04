import { Request, Response } from "express";
import * as i18n from "i18n";
import { getRepository } from "typeorm";
import { Config } from "../entity/Config";
import * as http from "http";
import { config } from "../config/config";
import * as path from "path";

class ConfigController {
  public static listAll = async (req: Request, res: Response) => {
    const configRepository = getRepository(Config);
    const configs = await configRepository.find();
    res.send(configs);
  }

  public static uploadImage = async (req: any, res: Response) => {
    req.files.file0.mv(path.join(config.files_storage_path, req.files.file0.name));
    res.send({status: true, name: req.files.file0.name});
  }

  public static getFile = async (req: any, res: Response) => {
    res.sendFile(path.join(config.files_storage_path, req.params.name.replace(/\//g, "_")));
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
  public static checkForUpdates = async (req: Request, res: Response) => {
    try {
      let data = JSON.parse(await new Promise((resolve, reject) => {
        http.get("http://localhost:8314", (d) => {
          let body = "";
          d.on("data", (chunk) => {
            body += chunk;
          });
          d.on("end", () => {
            resolve(body);
          });
        }).on("error", (er) => {
          reject(er);
        });
      }));
      if (!data) {
        data = {};
      }
      if (!data.data) {
        data.data = {};
      }
      data.data.currentVersion = "1.0.0";
      res.send(data);
    } catch (e) {
      res.status(500).send({message: e.toString()});
    }
  }
  public static update = async (req: Request, res: Response) => {
    res.send(JSON.parse(await new Promise((resolve, reject) => {
      http.get("http://localhost:8314/update", (d) => {
        let body = "";
        d.on("data", (chunk) => {
          body += chunk;
        });
        d.on("end", () => {
          resolve(body);
        });
      }).on("error", (er) => {
        reject(er);
      });
    })));
  }
}

export default ConfigController;
