import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Complain_form } from "./complain_form";
import { User } from "./Users";
import { Complain } from "./Complain";

@Entity("complain_log")
export class ComplainLog {
  @PrimaryGeneratedColumn()
  log_id: number;

  @ManyToOne(() => Complain, (complain) => complain.complain_id)
  @JoinColumn({ name: "complain_id" })
  @Column()
  complain_id: number;

  @ManyToOne(() => User, (user) => user.u_id)
  @JoinColumn({ name: "complain_user_id" })
  @Column()
  complain_user_id: number;

  @Column()
  complain_title: string;

  @Column()
  complain_prefix: string;

  @ManyToOne(() => Complain_form, (form) => form.form_id)
  @JoinColumn({ name: "form_id" })
  @Column()
  form_id: number;

  @Column({ type: "jsonb" })
  complain_data: string;

  @Column({
    default: 1,
  })
  complain_status: number;

  @Column({ default: null })
  trigger_time: string;

  @CreateDateColumn()
  created_at: Date;
}
