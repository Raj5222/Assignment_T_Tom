import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";import { User } from "./Users";
;


@Entity("complain_from")
export class Complain_form {
  @PrimaryGeneratedColumn()
  form_id: number;

  @Column()
  form_title: string;

  @Column({ type: "jsonb" })
  form_field_array: string;

  @ManyToOne(() => User, (user) => user.u_id)
  @JoinColumn({ name: "form_create_user_id" })
  @Column()
  form_create_user_id: string;
}