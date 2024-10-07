import { MigrationInterface, QueryRunner } from "typeorm";

export class Mstaff9181002100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "user" (firstname, lastname, password, email, jwt_token, mobile,u_id,role) 
      VALUES ('Raj', 'Sathvara', '0206', 'raj@gmail.com', 'whsj02wndjs',8154005222,'Raj0001','1')`
    );

    await queryRunner.query(
      `INSERT INTO "user" (firstname, lastname, password, email, jwt_token, mobile,u_id,role) 
      VALUES ('Raj', 'Sathvara', '0206', 'raj@gmail.com', 'whsj02wndjs',8154005222,'Raj0001','1')`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "user"`);
  }
}