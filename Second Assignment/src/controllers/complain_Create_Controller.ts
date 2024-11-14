import { Request, Response, Errback } from "express";
import { AppPostgressSource } from "../config/data-source1";
import { generateToken, verifyToken } from "../Services/jwt";
import moment from "moment";
import { Complain } from "../entity/Complain";
import { schedule } from "node-cron";


const userRepository = AppPostgressSource.getRepository(Complain);

// moment(new Date().toISOString().replace("T", " ").slice(0, 16)).isSameOrBefore("2010-10-21");
//Cron Job

schedule("*/10 * * * * *", async function () {
        //Cron Job Run Every 10 Sec..
    const Cronsresponse = await userRepository
      .createQueryBuilder("complain_table")
      .select(["complain_id", "trigger_time"])
      .where("complain_status = :status", { status: 2 })
      .getRawMany();

      Cronsresponse.map(async(complain)=>{
        const time = moment(
          complain.trigger_time,
          "MM/DD/YYYY, hh:mm:ss A"
        ).isSameOrBefore(new Date().toLocaleString());
        
        console.log(time)
        if(complain.complain_id && time){
          
            const resp = await userRepository
              .createQueryBuilder("complain_table")
              .update()
              .set({trigger_time: null, complain_status: 1})
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
        const token = req.headers.authorization;
        
        if (!token)res.json({ error: "Token Not Available" });

        // if (!incomigdata.token)
        //     res.json({
        //       error: "Token Not Available",
        //       token: generateToken(incomigdata.user_id),
        //     }); //When Token Not Available

        if(!incomigdata.complain_title)res.json({error: "Title Not Available"})
        if(!incomigdata.complain_data)res.json({ error: "Data Not Available" });
        if (!incomigdata.form_id)
          res.json({ error: "Form ID Not Available" });

        // if(!incomigdata.user_id)res.json({ error: "user_id Not Avalable" });
        if(incomigdata.complain_status === "Upcomming"){
             if(!incomigdata.trigger_time)res.json("trigger_time Not AValable");
             incomigdata.complain_status = 2             
            }else{
                delete incomigdata.trigger_time;
            }
        const { id } = await verifyToken(token); //Token Check

        if(id){

          // incomigdata.complain_data.map((data:any)=>{ //Check Form patterns
          //   if(data.gender){
          //     incomigdata.form_id = 1
          //   }

          //   if(data.fullname){
          //     incomigdata.form_id = 2
          //   }

          //   if(data.firstname && data.lastname){
          //     incomigdata.form_id = 3
          //   }

          //   if(data.firstname && data.lastname && data.gender){
          //     incomigdata.form_id = 4
          //   }

          //   if(data.fullname && data.gender){
          //     incomigdata.form_id = 5
          //   }

          //   if(data.gender && data.mobile){
          //     incomigdata.form_id = 6
          //   }

          //   if(data.fullname && data.gender && data.mobile){
          //     incomigdata.form_id = 7
          //   }
          // })

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