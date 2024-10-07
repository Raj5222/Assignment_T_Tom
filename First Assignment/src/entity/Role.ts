import { Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import { User } from "./Users";
import { Customer } from "./Customer";

export enum UserRole {
  SUPER_ADMIN = "Super Admin",
  ADMIN = "Admin",
  STAFF = "Staff",
  CUSTOMER = "Customer",
}
@Entity("role")
export class Roles{
  @PrimaryGeneratedColumn()
  @OneToMany(()=>User,(user)=>user.role)
  role_u_id: number;
  @Column({
    unique: true,
    enum: UserRole,
  })
  role: UserRole
}
