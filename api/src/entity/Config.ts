import {
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";

@Entity()
export class Config {
  @PrimaryColumn()
  public key: string;

  @Column({length: 1000000000})
  public value: string;
}
