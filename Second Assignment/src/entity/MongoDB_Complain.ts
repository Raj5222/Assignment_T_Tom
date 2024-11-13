import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("complains_log")
export class Complain_MongoDB_Log {
  @PrimaryGeneratedColumn()
  log_id: number;
  
  @Column()
  complain_id:number;

  @Column()
  complain_title: string;

  @Column()
  complain_data: any;

  @Column()
  complain_user_id: string;

  @Column()
  complain_status: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  updated_at: Date;
}
