import { Request, Response, Errback } from "express";
import { AppPostgressSource } from "../config/data-source1";
import { generateToken, verifyToken } from "../Services/jwt";
import moment from "moment";
import { Complain } from "../entity/Complain";
import { schedule } from "node-cron";
import { User } from "../entity/Users";


const userRepository = AppPostgressSource.getRepository(Complain);
const userTableRepository = AppPostgressSource.getRepository(User);

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
        //       token: await generateToken(incomigdata.user_id),
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

        const complain_prefix = await userTableRepository
          .createQueryBuilder("user")
          .select(["u_id"])
          .where("user_u_id = :id", { id })
          .execute();

        const count_prefix = await userRepository
          .createQueryBuilder()
          .select(["complain_id"])
          .where("complain_user_id = :id", { id })
          .execute();

        console.log("Prefix => ", complain_prefix[0].u_id);
        complain_prefix[0].u_id = complain_prefix[0].u_id + "_" + (count_prefix.length+1);

          const form_entity = await userRepository.query(
            `SELECT form_field_array FROM complain_from where form_id = ${incomigdata.form_id};`
          );
          
          const complainData = [];

          Object.keys(incomigdata.complain_data[0]).forEach((dataKey) => {
            const dataValue = incomigdata.complain_data[0][dataKey];
            const complainDataObject = { [dataKey]: dataValue };

            Object.keys(form_entity[0].form_field_array).forEach(
              (entityKey) => {
                if (dataKey === entityKey) {
                  complainDataObject.u_id =
                    form_entity[0].form_field_array[entityKey];
                }
              }
            );

            complainData.push(complainDataObject);
          });

          // Check for invalid form entities
          const invalidEntities = Object.keys(
            incomigdata.complain_data[0]
          ).filter(
            (dataKey) =>
              !Object.keys(form_entity[0].form_field_array).includes(dataKey)
          );

          if (invalidEntities.length > 0) {
            res.json({
              Message: `${invalidEntities.join(
                ", "
              )} are Invalid Form Entities`,
            });
          }

          console.log("JSON => ",complainData)
          delete incomigdata.complain_data

          if (invalidEntities.length === 0){

            const Response: any = await userRepository //Postgress
              .createQueryBuilder()
              .insert()
              .into(Complain)
              .values({
                ...incomigdata,
                complain_prefix: complain_prefix[0].u_id,
                complain_data: complainData,
                complain_user_id: id,
              })
              .execute();

              res.json({ Message:"New Complain Created"});
          }

        }else{
            res.status(500).json({ error: "Invalid Or Expired JWT token" });
        } 
    }catch(err){
        console.log("Complent Create Error => ",err)
        error(err)
    }
}