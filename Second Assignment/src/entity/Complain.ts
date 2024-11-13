import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";


@Entity("complain_table")
export class Complain {
  @PrimaryGeneratedColumn()
  complain_id: number;

  @Column()
  complain_title: string;

  @Column()
  complain_status: string;

  //   @Column()
  //   description: string

  //   @Column()
  //   complain_message: string;

  @Column({ type: "jsonb" })
  complain_data: string;

  @Column({default:null})
  trigger_time: number;

  @Column()
  complain_user_id: string;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;
}



@Entity("complain_log")
export class ComplainLog {
  @PrimaryGeneratedColumn()
  log_id: number;

  @Column()
  complain_id: number;

  @Column()
  complain_user_id: string;

  @Column()
  complain_title: string;

  @Column({ type: "jsonb" })
  complain_data: string;

  @Column()
  complain_status: string;

  @Column({ default: null })
  trigger_time: number;

  @CreateDateColumn()
  created_at: Date;
}