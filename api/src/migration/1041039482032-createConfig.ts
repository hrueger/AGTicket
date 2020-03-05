import {getRepository, MigrationInterface, QueryRunner} from "typeorm";
import { User } from "../entity/User";
import { Config } from "../entity/Config";

// tslint:disable-next-line: class-name
export class createConfig1041039482032 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const configs: Config[] = [];
        configs.push({key: "title", value: "My event"});
        configs.push({key: "location", value: "at that location"});
        configs.push({key: "date", value: "on 31.14.2021"});
        configs.push({key: "ticketsX", value: "2"});
        configs.push({key: "ticketsY", value: "5"});
        configs.push({key: "codeType", value: "qr"});
        configs.push({key: "idType", value: "guid"});
        configs.push({key: "ticketSpacing", value: "15"});
        configs.push({key: "borderWidth", value: "1"});
        const configRepo = getRepository(Config);
        return configRepo.save(configs);
    }

    // tslint:disable-next-line: no-empty
    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
