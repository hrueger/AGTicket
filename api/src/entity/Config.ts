import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from "typeorm";

@Entity()
export class Config {
  @PrimaryColumn()
  public key: string;

  @Column()
  public value: string;
}
