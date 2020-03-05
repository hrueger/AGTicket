import {
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";

@Entity()
export class Config {
  @PrimaryColumn()
  public key: string;

  @Column({length: 10000})
  public value: string;
}
