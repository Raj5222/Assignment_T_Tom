import { Request, Response, Errback } from "express";
import { AppPostgressSource } from "../config/data-source1";
import { generateToken, verifyToken } from "../Services/jwt";
import { Complain } from "../entity/Complain";
import { AppMongoDBSource } from "../config/data-source2";
import { QueryRunner } from "typeorm";
const mongoRepo = AppMongoDBSource.db("Coustomer_Log").collection("Logs");

export const complainUpdate = async (
  req: Request,
  res: Response,
  error?: Errback
) => {
  try {
    const PostgressrunQuery: QueryRunner =
      AppPostgressSource.createQueryRunner();
    await PostgressrunQuery.startTransaction(); //Postgress Transaction Start

    const MongoRunQuery = AppMongoDBSource.startSession(); //Mongo Session Create
    await MongoRunQuery.startTransaction(); //Mongo Transaction Start

    try {
      const updatedata = req.body;
      if (!updatedata.token) res.json("Token Not AValable");

      const { id } = await verifyToken(updatedata.token); //Token Check

      if (id) {
        if (updatedata.update === "All") {
          if (!updatedata.oldtitle) res.json("Oldtitle Not Available");
          if (!updatedata.Newtitle) res.json("Newtitle Not Available");
          if (!updatedata.complain_data)
            res.json("complain_data Not Available");

          const resp = await PostgressrunQuery.manager
            .getRepository(Complain)
            .createQueryBuilder("complain_table")
            .update()
            .set({
              complain_title: updatedata.Newtitle,
              complain_data: updatedata.complain_data,
            })
            .where("complain_title = :title AND complain_user_id = :id", {
              title: updatedata.oldtitle,
              id: id,
            })
            .returning("complain_id")
            .execute();

          // res.json(resp)
          if (resp.affected > 0) {
            resp.raw.map(async (complain: any) => {
              const MongoResponse: any = await mongoRepo.insertOne({
                complain_id: complain.complain_id,
                complain_user_id: id,
                complain_Old_Title: updatedata.oldtitle,
                complain_New_Title: updatedata.Newtitle,
                complain_data: updatedata.complain_data,
              });
            });

            res.json({
              Message: "Updated Your Complains.",
              affected_Complains: resp.affected,
            });
          } else {
            res.json("Not Found Any Your Complain For This Title");
          }
        } else {
          if (updatedata.oldtitle && updatedata.Newtitle) {
            //Update Complain Title Only

            const resp = await PostgressrunQuery.manager
              .getRepository(Complain)
              .createQueryBuilder("complain_table")
              .update()
              .set({
                complain_title: updatedata.Newtitle,
              })
              .where("complain_title = :title AND complain_user_id = :id", {
                title: updatedata.Newtitle,
                id: id,
              })
              .returning(["complain_id"])
              .execute();

            if (resp.affected > 0) {
              resp.raw.map(async (complain: any) => {
                const MongoResponse: any = await mongoRepo.insertOne({
                  complain_id: complain.complain_id,
                  complain_user_id: id,
                  complain_title: updatedata.title,
                  complain_New_Title: updatedata.Newtitle,
                });
              });

              res.json({
                Message: "Updated Your Complains Title.",
                affected_Complains: resp.affected,
              });
            } else {
              res.json("Not Found Any Your Complain For This Title");
            }
          }

          if (updatedata.title && updatedata.new_complain_data) {
            //Update Complain Data Only

            const resp = await PostgressrunQuery.manager
              .getRepository(Complain)
              .createQueryBuilder("complain_table")
              .update()
              .set({
                complain_data: updatedata.new_complain_data,
              })
              .where("complain_title = :title AND complain_user_id = :id", {
                title: updatedata.title,
                id: id,
              })
              .returning(["complain_id", "complain_data"])
              .execute();

            if (resp.affected > 0) {
              resp.raw.map(async (complain: any) => {
                const MongoResponse: any = await mongoRepo.insertOne({
                  complain_id: complain.complain_id,
                  complain_user_id: id,
                  complain_title: updatedata.title,
                  complain_Old_data: complain.complain_data,
                  complain_New_data: updatedata.new_complain_data,
                });
              });

              res.json({
                Message: "Updated Your Complains Data.",
                affected_Complains: resp.affected,
              });
            } else {
              res.json("Not Found Any Your Complain For This Title");
            }
          }
        }
      } else {
        res.json("Invalid Token Or Expired.");
      }

      await PostgressrunQuery.commitTransaction();
      await MongoRunQuery.commitTransaction();
    } catch (err) {
      PostgressrunQuery.rollbackTransaction();
      MongoRunQuery.abortTransaction();

      console.log("Compalin Transactons RollBack Update Error =>", err);
      error(err);
    }
  } catch (err) {
    console.log("Transaction Error =>", err);
    error(err);
  }
};
