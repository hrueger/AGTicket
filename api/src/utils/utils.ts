import * as fs from "fs";
import * as path from "path";
import { getRepository, getTreeRepository } from "typeorm";
import { config } from "../config/config";

export function genID(length = 16) {
   let result           = "";
   const characters       = "abcdefghijklmnopqrstuvwxyz0123456789";
   const charactersLength = characters.length;
   for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

export function toInt(v: string | number): number {
    if (typeof v == "string") {
       return parseInt(v, undefined);
    } else {
       return v;
    }
 }
