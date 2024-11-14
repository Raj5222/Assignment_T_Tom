import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./Users";
import { Complain_form } from "./complain_form";


@Entity("complain_table")
export class Complain {
  @PrimaryGeneratedColumn()
  complain_id: number;

  @Column()
  complain_title: string;

  @ManyToOne(() => Complain_form, (form) => form.form_id)
  @JoinColumn({ name: "form_id" })
  @Column({default:1})
  form_id: number;

  @Column({
    default: 1,
  })
  complain_status: number;

  //   @Column()
  //   description: string

  //   @Column()
  //   complain_message: string;

  @Column({ type: "jsonb" })
  complain_data: string;

  @Column({ default: null })
  trigger_time: string;

  @ManyToOne(() => User, (user) => user.u_id)
  @JoinColumn({ name: "complain_user_id" })
  @Column()
  complain_user_id: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;
}