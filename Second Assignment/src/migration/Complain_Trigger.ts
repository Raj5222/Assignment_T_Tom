import { MigrationInterface, QueryRunner } from "typeorm";

export class Complain_trigger1728887062280 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION Complain_Log_Trigger()
      RETURNS TRIGGER 
      LANGUAGE PLPGSQL
      AS
      $$
      BEGIN
      INSERT INTO "complain_log"(complain_id,complain_user_id,complain_title,complain_data,complain_status,trigger_time,form_id,complain_prefix)
      VALUES (NEW.complain_id, NEW.complain_user_id,NEW.complain_title,NEW.complain_data,NEW.complain_status,NEW.trigger_time,NEW.form_id,NEW.complain_prefix);      
      RETURN NEW;
      END;
      $$;
      `
    );

    await queryRunner.query(
      `CREATE TRIGGER after_user_complain
AFTER INSERT ON "complain_table"
FOR EACH ROW
EXECUTE FUNCTION Complain_Log_Trigger();
`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION Complain_Log_Trigger;`);
    await queryRunner.query(`DROP TRIGGER after_user_complain;`);
  }
}
