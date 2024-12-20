import { Request, Response, Errback } from "express";
import { AppPostgressSource } from "../config/data-source1";
import { Complain } from "../entity/Complain";
import { verifyToken } from "../Services/jwt";

const userRepository = AppPostgressSource.getRepository(Complain);

export const complainGet = async (
  req: Request,
  res: Response,
  error?: Errback
) => {

  try {

    const token = req.headers.authorization
    const verify_resp = await verifyToken(token); //Token Check
    const { id } = verify_resp;
    if(id){
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
          .where("complain_user_id = :id",{id:id})
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

      if (complain.filter) {
        const complaindata: any = await userRepository
          .createQueryBuilder("complain_table")
          .select([
            "complain_id",
            "complain_user_id",
            "complain_title",
            "complain_data",
            "complain_status",
            "trigger_time",
            "form_id",
            "created_at",
          ])
          .where("complain_data @>:filter", {
            filter: JSON.stringify([{ ...complain.filter.form_fileds[0] }]),
          })
          .getRawMany();  

          
          if (complaindata[0]) {
            res.json(complaindata);
          } else {
            res.json("Not Found Any Complain For This Filter.");
          }

      }

      if (complain.search) {
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
          .where(
            'complain_data::text ILIKE :search',
            { search: `%${complain.search}%` }
          )
          .getRawMany();

          // RAJ0001
          // RAJ0002
          
          // const matchdata = []
          // const x = await complaindata.map((data,c_idx)=>{

          //   for(const colums of Object.keys(data)) {

          //      console.log("Collums =>",colums ,"And =>",data[colums])
          //     const match = String(data[colums]).includes(complain.search);
          //     console.log("Matched =>",match)
          //     if(match){
          //       matchdata.push(complaindata[c_idx]) 
          //       break;
          //     }
          //   }

          //   console.log("Complain length", complaindata.length,"Current idx =>",c_idx);
          //   if(complaindata.length-1 === c_idx){
          //   }
          // })     

          if (complaindata[0]) {
            res.json(complaindata);
          } else {
            res.json("Not Found Any Complain For This Data.");
          }
      }
    }else{
      res.json("Invalid Token Or Expired.")
    }
  } catch (err) {
    console.log("Complain Getting Error => ", err);
    error(err);
  }
};
