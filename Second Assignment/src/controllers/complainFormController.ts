import { Request, Response, Errback } from "express";
import { AppPostgressSource } from "../config/data-source1";
import { generateToken, verifyToken } from "../Services/jwt";
import { Complain } from "../entity/Complain";
// import { MongoClient } from "mongodb"
import { AppMongoDBSource } from "../config/data-source2";
import { Complain_MongoDB_Log } from "../entity/MongoDB_Complain";
import { schedule } from "node-cron";
import { EntityManager, QueryRunner } from "typeorm";


const userRepository = AppPostgressSource.getRepository(Complain);
const mongoRepo = AppMongoDBSource.db("Coustomer_Log").collection("Logs");

//Cron Job
schedule("*/10 * * * * *", async function () {
        
    const Cronsresponse = await userRepository
      .createQueryBuilder("complain_table")
      .select(["complain_id", "trigger_time"])
      .where("complain_status = :status", { status: "Upcomming" })
      .getRawMany();

      Cronsresponse.map(async(complain)=>{
        if(complain.complain_id){
            const resp = await userRepository
              .createQueryBuilder("complain_table")
              .update()
              .set({trigger_time: null, complain_status: "Active"})
              .where("complain_id = :id", { id: complain.complain_id })
              .execute();

           console.log("Update Response =>", resp);

        }
      })

  console.log(`running a task every 10s Minutes =>`,Cronsresponse);
});

export const complainCreate = async (req: Request, res: Response, error?: Errback) => {
    try{
        const incomigdata = req.body;

        if (!incomigdata.token) res.json({ error: "Token Not Available" , token: generateToken(incomigdata.user_id)}); //When Token Not Available
        if(!incomigdata.complain_title)res.json({error: "Title Not Available"})
        if(!incomigdata.complain_data)res.json({ error: "Data Not Available" });

        // if(!incomigdata.user_id)res.json({ error: "user_id Not Avalable" });
        if(incomigdata.complain_status === "Upcomming"){
             if(!incomigdata.trigger_time)res.json("trigger_time Not AValable");
             if(incomigdata.trigger_time > 30)res.status(400).json("Trigger Time Is Wrogn You must Enter Less Then or Equal 30 ")
            }else{
                delete incomigdata.trigger_time;
                incomigdata.complain_status = "Active"
            }
          const verify_resp = await verifyToken(incomigdata.token); //Token Check
        const {id,exp } = verify_resp;

        delete incomigdata.token;

        if(exp && id){

            const Response:any = await userRepository //Postgress
              .createQueryBuilder()
              .insert()
              .into(Complain)
              .values({...incomigdata,complain_user_id:id}).execute()

              res.json({ Message:"New Complain Created"});



        }else{
            res.status(500).json({ error: "Invalid Or Expired JWT token" });
        } 
    }catch(err){
        console.log("Complent Create Error => ",err)
        error(err)
    }
}



export const complainGet =  async (req: Request, res: Response, error?: Errback) => {
  try{
    const complain = req.body;
      if(complain.data === "All"){
        const complaindata = await userRepository
          .createQueryBuilder("complain_table")
          .select([
            "complain_id",
            "complain_user_id",
            "complain_title",
            "complain_data",
            "complain_status",
            "trigger_time",
            "created_at"])
          .getRawMany();

          res.json(complaindata)
      }

      if(complain.name){
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
          .where("complain_title = :name",{name:complain.name})
          .getRawMany();
          if(complaindata[0]){
            res.json(complaindata);        
          }else{
            res.json("Not Found Any Complain For This Name.");        
          }
      }

      if(complain.user){
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




  }catch(err){
    console.log("Complain Getting Error => ",err)
    error(err)
  }  
}

export const complainUpdate =  async (req: Request, res: Response, error?: Errback) => {
  try{
    const PostgressrunQuery: QueryRunner = AppPostgressSource.createQueryRunner()
    await PostgressrunQuery.startTransaction(); //Postgress Transaction Start

    const MongoRunQuery = AppMongoDBSource.startSession() //Mongo Session Create
    await MongoRunQuery.startTransaction() //Mongo Transaction Start

    try{
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

      await PostgressrunQuery.commitTransaction()
      await MongoRunQuery.commitTransaction()

    }catch(err){
      PostgressrunQuery.rollbackTransaction()
      MongoRunQuery.abortTransaction()

      console.log("Compalin Transactons RollBack Update Error =>", err);
      error(err)
    }

  }catch(err){
    console.log("Transaction Error =>", err);
    error(err)
  }

}