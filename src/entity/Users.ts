import {
  Entity,
  Column,
  getRepository,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from "typeorm";
import { Roles } from "./Role";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  user_u_id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  password: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    default:false
  })
  status: boolean;

  @ManyToOne(() => Roles, (role) => role.role_u_id, {
    cascade: ["insert", "update", "remove"],
  })
  @JoinColumn({ name: "role" })
  @Column({ default: 3 })
  role: number;

  @Column({
    unique: true,
  })
  u_id: string;

  @Column({
    type: "bigint",
  })
  mobile: number;

  @Column()
  jwt_token: string;

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  async generateUId() {
    const userRepository = getRepository(User);
    const count = await userRepository.count({
      where: { firstname: this.firstname },
    });
    const index = count + 1;
    this.u_id = `${this.firstname}${index.toString().padStart(3, "0")}`;
  }
}
