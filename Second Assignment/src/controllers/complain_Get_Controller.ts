import { Request, Response, Errback } from "express";
import { AppPostgressSource } from "../config/data-source1";
import { Complain } from "../entity/Complain";

const userRepository = AppPostgressSource.getRepository(Complain);

export const complainGet = async (
  req: Request,
  res: Response,
  error?: Errback
) => {
  try {
    const complain = req.body;
    if (complain.data === "All") {
      const complaindata = await userRepository
        .createQueryBuilder("complain_table")
        .select([
          "complain_id",
          "complain_user_id",
          "complain_title",
          "complain_data",
          "complain_status",
          "trigger_time",
          "created_at",
        ])
        .getRawMany();

      res.json(complaindata);
    }

    if (complain.name) {
      const complaindata = await userRepository
        .createQueryBuilder("complain_table")
        .select([
          "complain_id",
          "complain_user_id",
          "complain_title",
          "complain_data",
          "complain_status",
          "trigger_time",
          "created_at",
        ])
        .where("complain_title = :name", { name: complain.name })
        .getRawMany();
      if (complaindata[0]) {
        res.json(complaindata);
      } else {
        res.json("Not Found Any Complain For This Name.");
      }
    }

    if (complain.user) {
      const complaindata = await userRepository
        .createQueryBuilder("complain_table")
        .select([
          "complain_id",
          "complain_user_id",
          "complain_title",
          "complain_data",
          "complain_status",
          "trigger_time",
          "created_at",
        ])
        .where("complain_user_id = :id", { id: complain.user })
        .getRawMany();
      if (complaindata[0]) {
        res.json(complaindata);
      } else {
        res.json("Not Found Any Complain For This User.");
      }
    }
  } catch (err) {
    console.log("Complain Getting Error => ", err);
    error(err);
  }
};
