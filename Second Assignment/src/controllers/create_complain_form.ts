import { Request, Response, Errback } from "express";
import { AppPostgressSource } from "../config/data-source1";
import { generateToken, verifyToken } from "../Services/jwt";
import { Complain_form } from "../entity/complain_form";

const userRepository = AppPostgressSource.getRepository(Complain_form);

export const complain_form_create = async (req: Request, res: Response, error?: Errback) => {
    try{
      const incomigdata = req.body;
      const token = req.headers.authorization;
      if (!token) res.json({ error: "Token Not Available" });
      if (!incomigdata.form_title) res.json({ error: "Title Not Available" });
      if (!incomigdata.form_field_array) res.json({ error: "Form Field Not Available" });
      const { id } = await verifyToken(token); //Token Check
      
      if(id){        

        let formtitle = incomigdata.form_title;
        let form_fields = {}
        let next_id = await userRepository.query(
           `SELECT MAX(form_id) + 1 AS next_id FROM complain_from;`
         );

        incomigdata.form_field_array.map((data,index)=>{
          form_fields[data] = `${formtitle.slice(0, 2)}_${next_id[0].next_id || 1}_${Math.floor(
            10000 + Math.random() * 80000
          )}`;
        })
        
        try{         
            const Response: any = await userRepository.createQueryBuilder()
              .insert()
              .into(Complain_form)
              .values({ form_title: formtitle,form_field_array:form_fields, form_create_user_id: id })
              .execute();

              res.json({ Message: "New Form Created" });
        }catch(err){
          res.json({ Message: "Form Name Already Avalable" });
          error(err)
        }


      }else{
        res.json("Token Invalid or Expired.")
      }
    }catch(err){
        console.log("Complain From Create Error => ",err)
        error(err)
    }
}