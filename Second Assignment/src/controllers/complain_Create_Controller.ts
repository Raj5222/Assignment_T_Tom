import { Request, Response, Errback } from "express";
import { AppPostgressSource } from "../config/data-source1";
import { generateToken, verifyToken } from "../Services/jwt";
import { Complain } from "../entity/Complain";
import { schedule } from "node-cron";


const userRepository = AppPostgressSource.getRepository(Complain);

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